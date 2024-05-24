require('dotenv').config();

const amqp = require('amqplib');
const nodemailer = require('nodemailer');

// RabbitMQ connection string
const { RABBITMQ_URL_CONSUMER, RABBITMQ_URL_PRODUCER } = process.env;

// RabbitMQ queue name
const exchangeName = 'notification';
const queueName = 'email';
const queueNameFailed = 'failed_email';

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    // Your nodemailer configuration
    host: '172.17.0.188', // Your SMTP server hostname
    port: 5220, // Your SMTP server port (this is typically 587 for TLS)
    secure: false, // true for 465, false for other ports
});

// Function to send email
async function sendEmail(message, headers) {
    const parsed = JSON.parse(message);

    try {
        const { type_email, subject_email, to } = parsed;
        // Send email using nodemailer
        await transporter.sendMail({
            from: 'Epurchasing Notification helpdesk@eurokars.co.id', // Sender email address
            to, // List of recipients
            subject: subject_email, // Subject line
            text: 'This is a test email sent from Node.js.' // Plain text body
        });

        console.log('Email sent successfully to : '+to);
    } catch (error) {
        console.error('Error sending email:', error);
        // Republish the message to the queue if sending email fails
        republishMessage(parsed, headers, error);
    }
}

// Function to republish message to queue
async function republishMessage(message, headers, error) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL_PRODUCER);
        const channel = await connection.createChannel();

        // await channel.sendToQueue(queueName, Buffer.from(message));
        const failedQueue = (headers.retryAttempts >= headers.maxAttempts) ? queueNameFailed : queueName;

        await channel.publish(exchangeName, failedQueue, Buffer.from(JSON.stringify({ message, error })), {
            headers: {
              token: headers.token,
              retryAttempts: headers.retryAttempts+1,
              maxAttempts: headers.maxAttempts
            }
          });
        
        console.log('Message republished to queue');
    } catch (error) {
        console.error('Error republishing message:', error);
    }
}

// Connect to RabbitMQ and consume messages
async function consumeMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL_CONSUMER);
        const channel = await connection.createChannel();

        console.log('Consumer connected to RabbitMQ. Waiting for messages...');

        // Consume messages from the queue
        channel.consume(queueName, async (message) => {
            if (message !== null) {
                try {
                    const messageContent = message.content.toString();
                    const headers = message.properties.headers;
                    console.log(headers)
                    await sendEmail(messageContent, headers);
                } catch (error) {
                    console.error('Error processing message:', error);
                } finally {
                    // Acknowledge the message
                    channel.ack(message);
                }
            }
        });
    } catch (error) {
        console.error('Error consuming messages:', error);
    }
}

// Start consuming messages
consumeMessages();

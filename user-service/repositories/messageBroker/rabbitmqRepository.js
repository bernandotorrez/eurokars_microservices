const amqp = require('amqplib');
const { RABBITMQ_URL } = process.env;

const RabbitMQ = {
  sendMessage: async (exchange, queue, message) => {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
  sendMessagNew: async (email) => {
    try {
      // Connect to RabbitMQ server
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      const message = JSON.stringify({
        type_email: 'email_otp',
        subject_email: 'Your Reset Password Request',
        to: email
      });

      await channel.publish('notification', 'email', Buffer.from(message), {
        headers: {
          token: 'xxx',
          retryAttempts: 1,
          maxAttempts: 3
        }
      });

      console.log('Queues and Exchange created successfully.');

      // Close the connection when done
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }
};

module.exports = RabbitMQ;

REST API Starter using Node JS + Express JS

Included :

1. Error Handling (with log file)
2. Server-Side Cache using Redis
3. CRUD Example
4. ORM (Sequelize)
5. Migration, Seeder
6. Repositories (Split your business logic and query database to Clean Code)
7. Routes (with Routes version)
8. Environment using .env file

Installation Instruction

1. Install XAMPP / LAMPP
2. run "npm install"
3. Install Redis (for Linux) or Memurai (for Windows) (Server-Side Cache)
4. Running Both XAMPP / LAMPP and Redis (if not, there will be error while running this Rest API)
5. run "npm run start:dev"
6. open browser then access to "http://localhost:3000/v1/task"

Adding new Table also Model?
1. run "npx sequelize-cli model:generate --name User --attributes [table field:table data type] (separates with comma)
    -> example : "npx sequelize-cli model:generate --name User --attributes username:string,password:string,level:integer"
2. Open migrations folder -> open new migration file
3. Change the Table Name to lower case name in :
    -> queryInterface.createTable('Users', to queryInterface.createTable('users'
4. Change createdAt to created_date and updatedAt to updated_date
5. Open model folder -> open new model file
    -> change : 
    sequelize,
    modelName: 'Users',

    -> to :
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    createdAt: 'created_date',
    updatedAt: 'updated_date',
    underscored: true
6. Run the migration "npx sequelize-cli db:migrate"

Author : Bernand Dayamuntari Hermawan

Tutorial Create New Service : 

1. Make Migration : npx sequelize migration:create --name create-<table_name>
2. Create Model : 
    2.1 Copy Paste existing Model
    2.2 Rename file like this : <serviceName>Model.js (ex: brandModel.js)
    2.3 Adjust the Model (Field, Model Name, Table Name, Relation if necessary)
3. Create Repository :
    3.1 Copy Paste existing Repository
    3.2 Rename file like this : <serviceName>Model.js (ex: brandRepository.js)
    3.3 Adjust the Repository (Model Name, Search Field, Insert, Update)
4. Create Validator :
    4.1 Copy Paste existing Validator
    4.2 Rename file like this : <serviceName>Validator.js (ex: brandValidator.js)
    4.3 Adjust the Validator (Validation Schema)
5. Create Route :
    5.1 Copy Paste existing Route
    5.2 Rename file like this : <serviceName>Route.js (ex: brandRoute.js)
    5.3 Adjust the Route
6. Register Route in server.js :
    app.use('/v1/<serviceName>', [expressMiddleware({ tracer: zipkinTracer('<serviceName>-service') })], authMiddleware, <serviceName>RouteV1);
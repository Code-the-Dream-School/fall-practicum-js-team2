const errorHandler = (err, req, res, next) => {
   if (err.name === "PrismaClientInitializationError") {
      console.error("Couldn't connect to the database. Is it running?");

      return res.status(500).json({
         error: "Database initialization failed"
      });
   }

   if (err.code === "ECONNREFUSED" && err.port === 5432) { // the postgresql port
    console.log("The database connection was refused.  Is your database service running?");

    return res.status(500).json({
         error: "Database connection refused"
      });
   } 
   
   console.error(err);
   
   return res.status(500).json({
      error: "Internal Server Error"
   });
}

module.exports = errorHandler;
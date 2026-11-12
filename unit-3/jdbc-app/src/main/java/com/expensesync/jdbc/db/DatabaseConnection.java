package com.expensesync.jdbc.db;

import org.h2.tools.RunScript;

import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static Connection connection = null;

    private static final String DEFAULT_H2_URL = "jdbc:h2:mem:expensesync_db;DB_CLOSE_DELAY=-1;MODE=MySQL";
    private static final String DEFAULT_MYSQL_URL = "jdbc:mysql://localhost:3306/expensesync_db?useSSL=false&allowPublicKeyRetrieval=true";

    public static synchronized Connection getConnection() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            return connection;
        }

        String dbType = System.getProperty("db.type", System.getenv("DB_TYPE"));
        if (dbType == null) dbType = "h2"; // Default to self-contained H2

        if ("mysql".equalsIgnoreCase(dbType)) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                String url = System.getProperty("db.url", System.getenv("DB_URL"));
                if (url == null) url = DEFAULT_MYSQL_URL;
                String user = System.getProperty("db.user", System.getenv("DB_USER"));
                if (user == null) user = "root";
                String pass = System.getProperty("db.password", System.getenv("DB_PASSWORD"));
                if (pass == null) pass = "root";

                connection = DriverManager.getConnection(url, user, pass);
                System.out.println("✓ Connected to MySQL database at: " + url);
                return connection;
            } catch (Exception e) {
                System.out.println("⚠️ MySQL connection failed (" + e.getMessage() + "). Falling back to embedded H2 database...");
            }
        }

        // Initialize Embedded H2 Database
        try {
            Class.forName("org.h2.Driver");
            connection = DriverManager.getConnection(DEFAULT_H2_URL, "sa", "");
            System.out.println("✓ Initialized In-Memory H2 Database (MySQL Mode).");
            initializeSchema(connection);
            return connection;
        } catch (ClassNotFoundException e) {
            throw new SQLException("H2 Driver not found in classpath", e);
        }
    }

    private static void initializeSchema(Connection conn) {
        try {
            // Check both relative and absolute paths for schema files
            Path schemaPath = Paths.get("../sql/schema.sql").toAbsolutePath().normalize();
            Path seedPath = Paths.get("../sql/seed.sql").toAbsolutePath().normalize();

            if (!Files.exists(schemaPath)) {
                schemaPath = Paths.get("unit-3/sql/schema.sql").toAbsolutePath().normalize();
                seedPath = Paths.get("unit-3/sql/seed.sql").toAbsolutePath().normalize();
            }

            if (Files.exists(schemaPath)) {
                RunScript.execute(conn, new FileReader(schemaPath.toFile()));
                System.out.println("✓ Loaded schema.sql via RunScript.");
                if (Files.exists(seedPath)) {
                    RunScript.execute(conn, new FileReader(seedPath.toFile()));
                    System.out.println("✓ Loaded seed.sql via RunScript.");
                }
            } else {
                System.err.println("⚠️ Schema file not found at: " + schemaPath);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Auto-seeding error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static synchronized void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("✓ Database connection closed.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}

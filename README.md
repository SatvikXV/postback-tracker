# S2S Postback Tracking MVP

This project is a Minimum Viable Product (MVP) of a Server-to-Server (S2S) affiliate postback tracking system, built with a Node.js backend, a Next.js frontend, and a PostgreSQL database.

## System Overview

[cite_start]In affiliate marketing, S2S postbacks are a reliable method for tracking conversions without relying on browser cookies[cite: 4]. [cite_start]The process involves the advertiser's server directly notifying the affiliate's server when a conversion, such as a purchase, occurs[cite: 4].

The typical flow is as follows:
1.  [cite_start]A user clicks an affiliate's tracking link, which registers the click event in the affiliate's system[cite: 6, 7].
2.  [cite_start]When the user completes a purchase on the advertiser's site, the advertiser's server sends a "postback" request to the affiliate's system with the relevant transaction details[cite: 8].
3.  [cite_start]The affiliate system validates this postback against the original click and records the conversion, making it visible to the affiliate in their dashboard[cite: 9].

This project implements the core logic for this flow.
## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

Make sure you have the following software installed on your machine:
* [Node.js](https://nodejs.org/) (which includes npm)
* [PostgreSQL](https://www.postgresql.org/download/)

### 1. Database Setup

1.  Open your PostgreSQL client (like `psql` or pgAdmin).
2.  Create a new database for the project. Let's call it `postback_tracker`.
3.  Run the following SQL script in the new database to create the necessary tables:

    ```sql
    -- Create the affiliates table
    CREATE TABLE affiliates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the campaigns table
    CREATE TABLE campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the clicks table
    CREATE TABLE clicks (
        id SERIAL PRIMARY KEY,
        click_id VARCHAR(255) UNIQUE NOT NULL,
        affiliate_id INTEGER REFERENCES affiliates(id),
        campaign_id INTEGER REFERENCES campaigns(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the conversions table
    CREATE TABLE conversions (
        id SERIAL PRIMARY KEY,
        click_id VARCHAR(255) REFERENCES clicks(click_id),
        affiliate_id INTEGER REFERENCES affiliates(id),
        amount DECIMAL(10, 2),
        currency VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add your database connection string. Replace the placeholder values with your actual PostgreSQL credentials.
    ```env
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/postback_tracker"
    ```
4.  Start the backend server:
    ```bash
    node index.js
    ```
    The server should now be running on `http://localhost:3001`.

### 3. Frontend Setup

1.  Open a **new terminal window** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    The frontend should now be running on `http://localhost:3000`.

    ## API Endpoints

Here are the details for the API endpoints available in this project.

### 1. Track a Click

This endpoint is used to record a new click event from an affiliate link.

* **Route:** `GET /click`
* **Description:** Stores an `affiliate_id`, `campaign_id`, and `click_id` in the database.
* **Query Parameters:**
    * `affiliate_id` (integer, required): The ID of the affiliate.
    * `campaign_id` (integer, required): The ID of the campaign.
    * `click_id` (string, required): A unique identifier for the click.
* **Example Request:**
    ```bash
    curl "http://localhost:3001/click?affiliate_id=1&campaign_id=1&click_id=UNIQUECLICKID123"
    ```

### 2. Send a Conversion Postback

This endpoint is used by the "advertiser" to notify the system of a successful conversion.

* **Route:** `GET /postback`
* **Description:** Validates the `click_id` and records a new conversion with the provided amount.
* **Query Parameters:**
    * `click_id` (string, required): The unique `click_id` from the original click.
    * `affiliate_id` (integer, required): The ID of the affiliate to validate against the click.
    * `amount` (float, required): The value of the conversion.
    * `currency` (string, optional): The currency of the amount (defaults to USD).
* **Example Request:**
    ```bash
    curl "http://localhost:3001/postback?click_id=UNIQUECLICKID123&affiliate_id=1&amount=99.99&currency=USD"
    ```

### 3. Get Affiliate Dashboard Data

This endpoint retrieves all click and conversion data for a specific affiliate.

* **Route:** `GET /dashboard/:affiliate_id`
* **Description:** Fetches all associated clicks and conversions for the given `affiliate_id`.
* **URL Parameter:**
    * `affiliate_id` (integer, required): The ID of the affiliate whose data you want to retrieve.
* **Example Request:**
    ```bash
    curl "http://localhost:3001/dashboard/1"
    ```
# Ace the Interview

This is an AI-powered mock interview platform built with Next.js, Genkit, and Firebase. It helps users practice for job interviews by providing AI-generated questions, resume analysis, and multimodal performance feedback.

## How to Run the Project

To run this project locally, you will need to have [Node.js](https://nodejs.org/) and npm installed.

### 1. Install Dependencies

First, install the necessary npm packages:
```bash
npm install
```

### 2. Set Up Environment Variables

The project uses Google's Generative AI. You will need to obtain an API key for the Gemini API from [Google AI Studio](https://aistudio.google.com/app/apikey).

1.  Create a new file named `.env` in the root of the project folder.
2.  Add your API key to the `.env` file like this:

```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 3. Run the Development Servers

This project requires two services to be running simultaneously: the AI backend (Genkit) and the web application frontend (Next.js). You will need to open **two separate terminal windows** for this.

**In your first terminal**, start the Genkit AI service:

```bash
npm run genkit:watch
```
This command starts the Genkit development server and will automatically restart it if you make any changes to the AI flows. Wait until you see a confirmation that the flows are available.

**In your second terminal**, start the Next.js web application:
```bash
npm run dev
```

### 4. Access the Application

Once both servers are running, you can access the application by opening your web browser and navigating to:

[http://localhost:9003](http://localhost:9003)

You can now use all the features of "Ace the Interview"!

## Deploying to Firebase App Hosting

This project is configured for deployment using [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). App Hosting provides a managed, secure, and scalable environment for running your full-stack Next.js application.

### Prerequisites

1.  **Firebase Account**: Make sure you have a Firebase account and have created a Firebase project.
2.  **Firebase CLI**: You need to have the Firebase Command Line Interface (CLI) installed. If you don't have it, install it globally by running:
    ```bash
    npm install -g firebase-tools
    ```

### Deployment Steps

1.  **Login to Firebase**:
    Open your terminal and log in to your Firebase account:
    ```bash
    firebase login
    ```

2.  **Initialize App Hosting**:
    In your project's root directory, run the `init` command for App Hosting:
    ```bash
    firebase init apphosting
    ```
    The CLI will guide you through the process:
    - It will ask you to select a Firebase project. Choose the project you want to deploy to.
    - It will detect your `apphosting.yaml` file and ask for a backend name (e.g., `ace-the-interview-backend`).
    - It will ask for the region where you want to deploy your resources.

3.  **Deploy the Application**:
    After initialization, you can deploy your application with a single command:
    ```bash
    firebase apphosting:backends:deploy
    ```
    This command will:
    - Build your Next.js application for production.
    - Provision the necessary cloud resources.
    - Deploy your entire application, including the AI flows.

4.  **Access Your Live Application**:
    Once the deployment is complete, the Firebase CLI will output the live URL for your application. You can share this URL with anyone to show them your project.

That's it! Your "Ace the Interview" platform will be live on the web.

## Uploading to GitHub

To save your work to GitHub, follow these steps. This will ensure your secret keys are not uploaded.

1.  **Create a New Repository on GitHub**
    *   Go to [GitHub.com](https://github.com) and log in.
    *   Click the **`+`** icon in the top-right corner and select **"New repository"**.
    *   Give your repository a name (e.g., `ace-the-interview`).
    *   **Important:** Do **not** check any of the boxes to add a `README`, `.gitignore`, or `license`, as your project already has these files.
    *   Click **"Create repository"**. On the next page, GitHub will show you a repository URL. You'll need it for step 4.

2.  **Initialize Git in Your Project Folder**
    *   Open your terminal and navigate into your project's root directory.
    *   Run this command to initialize a new Git repository and set the default branch name to `main`:
        ```bash
        git init -b main
        ```

3.  **Add and Commit Your Files**
    *   Add all your project files to be tracked by Git. The `.gitignore` file will automatically prevent your `.env` file and `node_modules` from being added.
        ```bash
        git add .
        ```
    *   Commit the files to your local repository:
        ```bash
        git commit -m "Initial commit"
        ```

4.  **Connect to Your GitHub Repository**
    *   Link your local repository to the one you created on GitHub. Replace `<YOUR_REPOSITORY_URL>` with the URL from step 1.
        ```bash
        git remote add origin <YOUR_REPOSITORY_URL>
        ```

5.  **Push Your Code to GitHub**
    *   Finally, push your code to GitHub:
        ```bash
        git push -u origin main
        ```
    Your code is now safely stored on GitHub.

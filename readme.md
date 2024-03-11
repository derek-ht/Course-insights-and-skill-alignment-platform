# Installation Instructions

1. **Install Node:**

   - Visit [Node.js official website](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) for installation instructions.

2. **Install Node Modules:**

   - Change the current directory to `backend/`.
   - Run `npm i` to install all required node modules.
   - Repeat the same process for `frontend/`.

3. **Add Environment Variables:**

   - Add a `.env` file in `backend/` with the following contents:
     ```
     DATABASE_URL
     PRIVATE_KEY
     EMAIL_USER
     EMAIL_PASS
     ```
   - Add a `.env.local` file to `frontend/` with the following contents:
     ```
     NEXT_PUBLIC_BACKEND_URI
     NEXT_PUBLIC_FRONTEND_URI
     ```

4. **Install Puppeteer Dependencies:**

   - For Windows, no additional steps are needed.
   - For Linux and Mac, run the following commands:
     ```bash
     sudo apt-get install libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon-x11-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2
     sudo apt-get update -y
     sudo apt-get install -y libcups2
     ```

5. **Install Python:**

   - Follow the instructions at [Python official website](https://www.python.org/downloads/) for installation.

6. **Install Python Libraries:**

   - If Python is installed from python.org, pip should be automatically installed.
   - If not, follow the [pip installation guide](https://pip.pypa.io/en/stable/installation/).
   - Run the following commands to install required Python libraries:
     ```bash
     pip3 install numpy
     pip3 install pandas
     pip3 install yake
     pip3 install --user -U nltk
     pip3 install -U scikit-learn
     ```

7. **Install NLTK Stopwords:**

   - Execute the Python script located in `backend/src/python/install_stopwords.py`.
     - For Windows: `python backend/src/python/install_stopwords.py`
     - For Linux and Mac: `python3 backend/src/python/install_stopwords.py`

8. **Generate Prisma Client:**

   - Run the following command in `backend/`:
     ```bash
     npx prisma generate
     ```

9. **Start the Program:**
   - Open one terminal and run `npm start` in the root `backend` directory.
   - Open another terminal and run `npm run dev` in the root `frontend` directory.

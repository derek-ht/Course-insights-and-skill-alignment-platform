import { UserType } from '@prisma/client'
import prisma from '../libs/prisma.ts'
import { register, createProject, getRandomInt, getUId, createCourse } from './utils.ts'

const FirstNameBank = [
    'Adam', 'Ethan', 'Derek', 'Laura', 'Emmie', 'James', 'Codey', 'Jayden', 'Kyle', 'John', 'Jason', 'Victor'
]

const LastNameBank = [
    'Smith', 'Wang', 'Chen', 'Tran', 'Nguyen', 'Wen', 'Fong', 'Mcdonald', 'Bartholomew', 'Wu', 'Wicks', 'Hoffmann'
]

const courseCodeBank = [
    'COMP1511', 'COMP1521', 'COMP1531', 'COMP2521', 'COMP2511', 'COMP3311', 'COMP3331', 'COMP3231', 'COMP3511', 'COMP2041', 'COMP6080', 'COMP6771', 'COMP6991',
    // 'COMP3121', 'COMP4920', 'COMP3900', 'COMP3141', 'COMP9417', 'COMP9517', 'MATH1131', 'MATH1141', 'MATH1231', 'MATH1241', 'MATH2011', 'MATH2111', 'MATH2121',
    // 'MATH2221', 'MATH2501', 'MATH2601', 'MATH2521', 'MATH2621', 'MATH2801', 'MATH2901', 'MATH2831', 'MATH2931', 'MATH3801', 'MATH3901', 'MATH1081', 'MATH3161',
    // 'MATH2301', 'MATH3411'
]

const courseYearBank = ['2021', '2022', '2023', '2024']

async function main() {
    const userCount = 10;
    for (let i = 0; i < userCount; i++) {
        const firstName = FirstNameBank[i]
        const lastName = LastNameBank[i]
        register(firstName, lastName, `${firstName}${lastName}@student.unsw.edu.au`, 'Password123?', UserType.STUDENT)
    }

    var academic = await register('Hagrid', 'Snipes', `hagridsnipes@staff.unsw.edu.au`, 'Password123?', UserType.ACADEMIC)
    var academic = await getUId('hagridsnipes@staff.unsw.edu.au')

    // for (let i = 0; i < courseCodeBank.length; i++) {
    //     for (let j = 0; j < courseYearBank.length; j++) {
    //         createCourse(academic, courseCodeBank[i], courseYearBank[j])
    //     }
    // }

    createProject({
        title: 'Course Insight and Skills Alignment Platform',
        description: '',
        scope: '',
        topics: [''],
        requiredSkills: ['UI/UX', 'Agile', 'Database Management', 'NLP'],
        outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Trajectory Recovery from Ash: In the Age of AI',
        description: `Location trajectories collected by smartphones and other devices represent a valuable data source for
        applications such as location-based services. Likewise, trajectories can potentially reveal sensitive
        information about individuals, e.g., religious beliefs or sexual orientations. Consequently, safeguarding
        trajectory datasets becomes imperative.
        A prevalent approach to address privacy concerns involves releasing solely aggregated data. For
        instance, one might release the count of users connected to a specific mobile phone antenna at a given
        time. While this might appear reasonably secure, the widely cited paper "Trajectory Recovery from
        Ash: User Privacy Is NOT Preserved in Aggregated Mobility Data" exposed that aggregation offers a
        false sense of privacy. The paper demonstrated the possibility of recovering user trajectories with
        remarkably high accuracies of 73-91%.
        This work was published over six years ago. Since then, machine and deep learning rapidly progressed
        in performance, usability, and capabilities. This raises the intriguing question of to what extent deep
        learning further increases the risk of user re-identification from aggregated location data. Previous
        research [2] has already shown that the privacy provided by traditional mechanisms can be
        significantly reduced through deep learning-based attacks.
        This project's objective is to ascertain whether AI also poses a threat to the privacy of aggregated
        location data. The primary research question is: "Can deep learning be harnessed to re-identify users
        from aggregated location data with greater accuracy than the attack outlined in the paper 'Trajectory
        Recovery from Ash [1]'?"
        Notably, the original paper reports remarkably high accuracies, reaching 90%. However, these figures
        are anticipated to be lower for alternative datasets with differing properties, such as higher user
        numbers. Hence, there exists ample room for enhancement.`,
        scope: '',
        topics: ['Software Development/Engineering', 'Algorithms', 'Machine Learning', 'Deep Learning', 'Data Science'],
        requiredSkills: ['Deep learning', 'Python', 'Academic Reading'],
        outcomes: ['Project documentation', 'Source code', 'Technical Guide'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Formatif: Learning and Feedback Development',
        description: `Formatif is a learning and feedback platform used by six universities and hundreds of
        thousands of users have used the system to revolutionise their teaching and learning
        experience. `,
        scope: `This project is a full-stack development project working on a large-scale software project to
        fix bugs, enhance features, and contribute new ideas to make a real impact on teaching and
        learning. Further details to be discussed in the client meetings. The project will be supported
        by experienced developers in the entirely open-source ecosystem."
        `,
        topics: ['Software Development/Engineering', 'Web Development'],
        requiredSkills: ['Frontend', 'Backend', 'Typescript', 'Ruby', 'Modern Tech Stack', 'Software development'],
        outcomes: ['Source code', 'Documentation', 'How-to user guides and videos'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Optimising Electric Vehicle Charging Station Locations in NSW',
        description: `Optimising Electric Vehicle Charging Station Locations in NSW Australian consumers are
        interested in Electric Vehicle ownership. A 2021 consumer attitudes study found that 54% of
        respondents would consider an Electric Vehicle as their next vehicle purchase. Despite this
        only 20,000 Electric Vehicles (EVs) have been sold in Australia over the last decade. One of the
        key barriers to EV ownership is the lack of charging infrastructure and availability to recharge.
        To support the Electric Vehicle, transition the NSW government plans to deliver an additional
        30,000 Electric Vehicle chargers by 2026. Over the years, researchers have explored strategic
        modelling and multiple approaches to determine where to install EV charging infrastructure
        location and charging stations. Governments have published guidelines to support charging
        station installations, recommending locations and place. In 2021, the NSW Electric Vehicle
        Fast Charging Infrastructure Master Plan was published to assist developers identify
        potentially appropriate areas for the development of Electric Vehicle fast charging
        infrastructure. Data and information available in the ‘Master Plan’ is presented on a map and
        was published to promote the new EV fast charging infrastructure. Used as a guide, all data
        used to compile the Master Plan was publicly sourced and is freely available. The master was
        the first step in the roll out of guaranteed widespread fast charging, highlighting where
        stations could be optimally placed. This meant that EV drivers could be confident they could
        drive their vehicles whenever and wherever they needed to. The National Electric Vehicle
        Strategy was published in April 2023 and paves the way for greater access to charging stations
        amongst other priorities.`,
        scope: `The goal of this project is to find where new charging stations should be placed to meet
        future consumer demands. In this project, various public data sources (e.g., the ABS data,
        NSW traffic volume viewer, NSW EV Fast Charging Infrastructure Master Plan, flood data) will
        be explored to propose new charging locations in NSW. Further details will be discussed in
        the client meetings.`,
        topics: ['Big Data Analytics and Visualization', 'Machine Learning', 'Deep Learning NLP'],
        requiredSkills: ['Machine Learning', 'Python', 'Data visualisation', 'Algorithms', 'Optimization'],
        outcomes: ['Source code', 'Documentation', 'How-to user guides and videos'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Developing a Dynamic Token Valuation Model for Carbon Credits',
        description: `The advent and rapid adoption of blockchain technology in recent years have paved the way
        for innovative solutions to address longstanding challenges across various sectors. One such
        sector, carbon trading, has witnessed the transformative potential of blockchain through the
        tokenization of carbon credits. By representing carbon credits as unique digital tokens on a
        blockchain, tokenization ensures traceability, transparency, and ease of trade. However, as
        tokenization becomes more widespread, it's becoming increasingly apparent that there are
        disparities in how these tokens are valued. Factors such as the origin of the carbon credit
        (geography), the methodology employed for carbon capture or reduction, and the specific
        project type all play a role in determining its value. However, the lack of a standardized
        valuation methodology across various decentralized blockchain-based carbon trading
        platforms has led to inconsistencies in how tokens are valued. These inconsistencies can result
        in market inefficiencies and undermine system trust. Therefore, addressing these valuation
        challenges is paramount, given the global urgency to address climate change and make carbon
        trading more effective and efficient.
        This project focuses on the challenges surrounding tokenization and value assessment of
        carbon credits in blockchain. It offers timely and relevant subject matter that aligns well with
        the interdisciplinary nature of the capstone projects, encompassing aspects of computer
        science, economics, and environmental science. This project presents an excellent
        opportunity for students to gain hands-on experience with emerging technologies like
        blockchain while addressing real-world problems in the domain of carbon trading and climate
        action. 
        The main goals of this projects are:
        1. Design a Unified Valuation Framework: Create a comprehensive framework considering
        the multifaceted variables influencing carbon credit values. This framework should be
        flexible enough to accommodate new factors as they emerge, ensuring its relevance and
        adaptability in the long run.
        2. Develop a Dynamic Token Valuation Model: Using the above framework as a foundation,
        design and implement an algorithmic model capable of dynamically assessing the value of
        carbon credit tokens. This model should not just be a static rule-set but should leverage
        machine learning techniques to adapt and refine its valuation strategies based on real-world
        data (Optional).
        3. Test and Validate the Model: Once developed, the model should undergo rigorous testing
        using real-world data sets to ensure accuracy, fairness, and robustness. Feedback loops
        should be incorporated to continually refine and optimize the model (Optional)." "Project `,
        scope: `Research and Data Collection: The team should gather data on current carbon credit token
        valuations, factors affecting their price, and market dynamics.
        Understanding Tokenization: The team needs a fundamental grasp of how tokenization
        works in the context of carbon credits. Basic blockchain knowledge would be helpful, though
        in-depth technical knowledge is not required.
        Stakeholder Consultation: Engage with carbon trading platforms, environmentalists, and
        industry experts to understand the real-world challenges they face in token valuation.
        Model Development: Using the insights gained, develop a simple algorithmic model that can
        factor in 2-3 key variables (like geography and carbon capture methodology) to arrive at a
        token value.
        Prototyping and Testing: Implement a basic prototype of the valuation model and test it
        against sample data to ensure it's working as expected.
        Documentation: All processes, findings, challenges, and steps taken should be welldocumented, providing a roadmap for future teams or developers who might want to
        expand on this work.
        Presentation: The team should be capable of showcasing their findings and prototype
        understandably to a non-technical audience.
        Scope:
        • Focus on Primary Variables: Given the time constraints and the complexity of the
        problem, the scope should be narrowed down to consider only 2-3 primary variables
        that influence token value. While many variables affect token valuation, prioritizing
        the most influential ones will make the project manageable.
        • Limited Geographic Region: Instead of a global approach, the model could focus on
        carbon credit tokens originating from a specific region, e.g., Southeast Asia, to
        simplify the data collection and valuation processes.
        • Prototype, Not Production: The goal is to develop a functional prototype that
        showcases the valuation model's potential. It doesn't need to be a fully-fledged,
        production-ready system.
        • Use of Existing Tools: To simplify the project, students should leverage existing tools
        and platforms for model development and prototyping, rather than building
        everything from scratch.
        • Iterative Feedback: The project should adopt an iterative approach instead of aiming
        for a perfect model in the first go. Initial findings and the prototype can be shared
        with the client for feedback, which can then be incorporated into refinements.
        • Focus on Transparency: While advanced techniques can be employed in the model,
        the resulting valuation process must remain transparent and easily understandable.
        This ensures trust and clarity for all stakeholders."`,
        topics: ['Software development', 'Computer Science and Algorithms',
            'Blockchain Technology', 'Machine Learning', 'Deep Learning', 'Big data analytics', 'Visualization'],
        requiredSkills: ['Blockchain Technology', 'Data analysis and modelling', 'Machine Learning',],
        outcomes: ['Source code', 'Documentation', 'How-to user guides and videos'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Consultation Management System',
        description: `The ZZSC9020 course necessitates academics to offer multiple consultation session times
        throughout the week. Each team can then select one session per week to meet with a
        mentor. While Moodle already includes this function, it faces several limitations. The
        following is a list of these limitations:
        1. Connection with UNSW's Academic and Outlook Calendars: The system lacks integration
        with UNSW's academic calendar and Outlook calendar.
        2. Admin Intervention for Session Changes: Lecturers must contact the Moodle admin team
        to make any changes to a session.
        3. Confusing Schedules: The schedules are extremely confusing and difficult for mentors to
        read.
        4. Unified Platform for Notes and Zoom Links: There is no unified platform for sharing notes
        and Zoom recording links. Mentors need to email each team separately with their notes and
        Zoom links.
        5. Lack of Record Keeping: The system doesn't keep records of which team met with which
        mentor.
        6. Use of Student Lists Instead of Team Names: The system uses lists of students' names
        rather than the names of the teams.
        7. Excessive Emails: Mentors receive four emails for each booking`,
        scope: `The project entails creating a website to manage consultation bookings for teams. Here's a
        simplified list of requirements:
        1. Easy Addition and Modification of Consultation Times: Mentors should be able to
        effortlessly add and modify consultation times.
        2. Team-Based Booking: Students can form teams and choose a booking session.
        3. Advance Question Submission: Students should be able to attach or enter their questions
        one day before the session.
        4. Booking Window Limit: The system should prevent teams from booking a session within a
        specific time before the meeting, as set by the mentors.
        5. Automatic Calendar Update: The system should automatically update the mentor's UNSW
        staff calendar once a booking is made.
        6. Note Sharing: Mentors should be able to enter their notes on the website, which will be
        shared with the respective teams.
        7. Zoom Recording Sharing: After the session ends, the Zoom meeting recording should be
        shared with each team.
        8. Customizable Email Notifications: Mentors should have the option to choose the level of
        email notifications they receive.
        9. Server Requirement: The system should run on CSE servers. Server details:
        [https://taggi.cse.unsw.edu.au/FAQ/Test_CGI_Server/]`,
        topics: ['Software Development', 'Computer Science and Algorithms', 'Web application development'],
        requiredSkills: ['Web applications', 'Hardware systems', 'Software development and testing'],
        outcomes: ['Source code', 'Documentation', 'Functional on CSE servers'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Automatic Image Annotation using Deep Multi-Label Learning',
        description: `Automatic image annotation is the process that automatically assigns labels in the form of
        captioning or keywords to a digital image. This can be regarded as a multi-class image
        classification problem in machine learning and deep learning.
        Deep multi-label learning, which aims to recognise all the relevant labels in an image, is a
        fundamental task in computer vision applications, such as scene understanding, surveillance
        systems and self-driving cars. In real-world applications, multi-label recognition systems
        should learn tens of thousands of labels, locate them in images, and even deal with many
        unseen labels. To date, classic multi-label classification methods trained and tested with seen
        labels are far from fulfilling the requirements for real applications, where plenty of unseen
        labels exist.`,
        scope: `To tackle the above issues, the project aims to address the following requirements:
        1. Introduce a deep contrastive learning model to optimise deep multi-label learning,
        2. Develop a corresponding tool for automatic image annotation, and
        3. Write a research report to systematically introduce the model and the tool.
        This project involves both a theoretical understanding and a practical implementation of deep
        learning models. It also involves design and development of User Interface (UI) for automatic
        image annotation. Further details can be discussed in the client requirements. `,
        topics: ['Software Development', 'Deep Learning', 'Data Science', 'HCI'],
        requiredSkills: ['Deep Learning', 'UI design and development', 'COMP9444', 'COMP9517', 'COMP3511'],
        outcomes: ['Source code', 'Documentation in the form of report', '• A tool for automatic image annotation '],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    var academic = await register('Jake', 'Potter', `JakePotter@staff.unsw.edu.au`, 'Password123?', UserType.ACADEMIC)
    var academic = await getUId('JakePotter@staff.unsw.edu.au')

    createProject({
        title: 'Explainable Fake New Detection on Twitter',
        description: `Detecting fake news on social media is the process of analysing the news contents to
        determine the truthfulness of the news. The news could contain information in various
        formats such as text, video, image.
        Previous fake news detection systems typically only give a final decision as to whether the
        news under investigation is fake or not, with little explanatory information revealed about
        why the decision is made. Such a coarse dichotomy does not account for the nature of fake
        news being a combination of mis/disinformation mixed with factual information and
        ignoring rich and highly contextualised psycho-social and cognitive factors`,
        scope: `The goal of this project is to explore interpretable machine-learning techniques and generate
        appropriate user-interpretable explanations. We will adopt the Linguistic Inquiry and Word
        Count’s (LIWC) high-level language-bound psychological feature sets to extract the most
        explainable sentences out of a given news article and extract the most relevant psychological
        features to generate appropriate user-interpretable explanations. We will particularly focus
        on the social platform, Twitter, where we can crawl data with the open-source Twitter API. We
        aim to develop a tool for the automatic detection of fake news spreading on Twitter.`,
        topics: ['Software Development', 'Deep Learning', 'Data Science', 'HCI'],
        requiredSkills: ['Deep Learning', 'Python', 'UI design and development', 'COMP9444', 'COMP3511'],
        outcomes: ['Source code', 'Tool for fake news detection', 'Documentation in form of report'],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'ESG Management System (Web Application) for FinTech Industry',
        description: `In a world increasingly focusing on sustainable development, investors are leaning towards
        green finance, and corporations are adopting sustainable business ethics. Global initiatives
        like The Paris Agreement, the United Nations Environment Programme (UNEP), Fixed Income
        (FI), International Financial Reporting Standards (IFRS), The Financial Stability Board created
        the Task Force on Climate-related Financial Disclosures (TCFD), Net-zero, and the Proponent
        of Responsible Investment PRI underline this shift.`,
        scope: `The goal of this project is to develop a web application to help users to manage ESG
        (Environmental, Social, Governance) data. User can select an ESG framework of interest,
        browse and add ESG metrics, request ESG indicators, adjust metrics’ weights according to
        defined standards or stakeholder needs, and identify corresponding data sources.
        1. Account management: users can register/create their account and login.
        2. Select Framework: Users should be able to choose a framework of interest from list of
        frameworks.
        3. Brow Metrics: Users should be able to browse ESG metrics related to the selection
        framework.
        4. Add Metrics: Users should be able to add ESG metrics based on defined standards or needs.
        5. Check Indicators: Users should be able to request ESG indicators.
        6. Adjust Metrics s: Users should be able to adjust metrics and indicators' weights according to
        defined standards or stakeholder needs.
        7. Identify Data Source: Users should be able to identify each metric and indicator's data
        sources.`,
        topics: ['Software Development', 'Web Application', 'Big Data Analytics and visualisation'],
        requiredSkills: ['Web development', 'frontend', 'backend', 'HTML', 'CSS', 'Javascript', 'Database management system'],
        outcomes: ['Source code', `Project documentation including application design and architecture, system and
        user workflows, data models, user guide`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: 'Building Sustainability Indicators APIs for FinTech Industry',
        description: `In a world increasingly focusing on sustainable development, investors are leaning towards
        green finance, and corporations are adopting sustainable business ethics. In the current global
        scenario, sustainable development is crucial. Investors and corporations are progressively
        focusing on Environmental, Social, and Governance (ESG) metrics. Global initiatives like The
        Paris Agreement, the United Nations Environment Programme (UNEP), Fixed Income (FI),
        International Financial Reporting Standards (IFRS), The Financial Stability Board created the
        Task Force on Climate-related Financial Disclosures (TCFD), Net-zero, and the Proponent of
        Responsible Investment PRI underline this shift.`,
        scope: `The goal of this project is to design and develop of an ESG Metrics Management System,
        accessible via APIs, which would enable users to compute and manage sustainability
        indicators using various data sources. The requirements include the following:
        • Web platform that enables users to compute sustainability indicators (using defined metrics)
        based on various data sources.
        o Choose data sources to extract important information related to sustainability
        indicators.
        o Compute sustainability indicators and store them along with associated data.
        o Indicators can be computed and validated by considering methods such as topic
        similarity, Sentiment Analysis and document complexity.
        ▪ Indicators will be computed using related machine learning and NLP (further
        details will be discussed in the first client meeting)
        • Design and implement APIs that allow the following functionality:
        o User API Calls: Users should be able to make API calls specifying the required
        parameters (e.g., company name, date range, type of indicators needed, etc.).
        o Data Retrieval: The API should be able to retrieve data from specified sources based
        on the parameters provided in the API call.
        o Data Processing: The API should preprocess the retrieved data, compute the
        required indicators, and validate the computed indicators.
        o Response Formulation: The API should format the computed indicators into the
        desired response format and send the response back to the user.
        o Error Handling: The API should handle various situations such as data unavailability,
        invalid parameters, or invalid computed indicators, and send appropriate error
        responses.
        o API Call: Make an API call to request the computation of specific indicators.
        o Response Retrieval: Receive the response containing the computed indicators or an
        error message.
        Examples of the data sources include the following:
        • Eikon: Conference Call Transcript Dataset
        • ASX: Company Announcements Summary (SIRCA)
        • World Bank: http://info.worldbank.org/governance/wgi/
        • NGER: Corporate emissions and energy data
        (https://www.cleanenergyregulator.gov.au/NGER/National%20greenhouse%20and%20energ
        y%20reporting%20data/Corporate%20emissions%20and%20energy%20data )`,
        topics: ['Software Development', 'Web Application', 'Big Data Analytics and visualisation'],
        requiredSkills: ['Web development', 'frontend', 'backend', 'HTML', 'CSS', 'Javascript', 'Database management system',
            'API design and development', 'data processing libraries'],
        outcomes: ['Source code', `Project documentation including application design and architecture, system and
        user workflows, data models, user guide`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: `Building FinTech Microservices for Data Analytics and Automated Machine
        Learning`,
        description: `Data analytics and machine learning often involve an intricate combination of data collection,
        processing, and visualization. Each task can be complex and resource intensive. This project
        aims to break down these monolithic tasks into smaller, more manageable components—
        microservices—that can be developed, deployed, and scaled independently.`,
        scope: `In this capstone project, students will work as a team to develop a set of microservices using
        the Python programming language. They will be responsible for creating Python functions for
        data collection, data processing, visualization, and automated machine learning (AutoML)
        applications, which will then be integrated into cohesive data analytics pipelines. Students will
        also need to develop a Web UI to run these services. The following are the core requirements
        involved in this project:
        • Data Collection Microservices: a Python function to collect data from various sources
        (APIs, databases, etc.).
        • Data Processing Microservices: a Python function to clean, transform, and preprocess
        the data.
        • Data Visualization Microservices: a Python function to visualize data in different
        formats (graphs, charts, etc.).
        • Automated Machine Learning (AutoML) Microservices: Using existing Python
        packages, a Python function to automatically train, evaluate, and deploy machine
        learning models.
        • User Interface: a web interface using Python widgets/dashboard library or a Jupyter
        widgets app to interact with the microservices.
        • Integration: combine all microservices (Python functions) into a single application,
        ensuring smooth data flow between each microservice.
        A guideline will be provided for building the microservices.`,
        topics: ['Software Development', 'Web Application', 'Big Data Analytics and visualisation', 'Machine Learning'],
        requiredSkills: ['Python', 'Data processing', 'machine learning', 'cloud storage', 'Web application'],
        outcomes: [`• Documentation detailing the design, architecture, and usage of the microservices.`,
            `A presentation or demo showcasing the application and its capabilities.`,
            `Implement the system for one or more case studies to demonstrate its utility.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: `Course Insight and Skills Alignment Platform`,
        description: `The project aims to develop a web application platform that collect and aggregate course
        information (course outlines) from different data sources (e.g., web pages, other systems) and
        provides users with a way to summarize the topics, knowledge, and skills covered in each
        course. Additionally, the application allows users to input their completed courses, and work
        experience, and assess how well their knowledge and skills align with project requirements`,
        scope: `Users
        • Admin users can manage user accounts and the platform.
        • Users with different roles and responsibilities can create their account, login and
        operate the system based on their roles and responsibilities.
        • Users can edit/maintain their profiles.
        Academic users
        • Academic users (with privileges) can choose to scrape or collect course information
        from selected sources (e.g., web page, files, or other system). Collected course
        information will be saved and updated in a database with version history
        (timestamped).
        • Academic users can add course to summarize by providing data source of the course
        information / outline (extracted from one or more data sources – files, web page, other
        system). Course summary can include key skills, knowledge areas, topics.
        • Academic users can see and visualize the topics, knowledge, and experience of one or
        more course (both textual and visual summary)
        • Academic users can add projects and specify project details (title, scope,
        requirements, skills, knowledge areas/topics, expected outcomes)
        Student users
        • Students can create their own profile and maintain it.
        • Students can add/choose list of courses they have successfully completed. This can be
        done through manual selection of courses and through uploading academics
        transcripts. The system will provide a summary of the overall gained knowledge with
        different views. It will also provide summary of skills and knowledge of each course.
        The summaries will include textual and visual formats.
        • Students can generate skills gap analysis through the system, highlighting the extent
        to which a student profile meets knowledge and skills of a project.
        • Students can see list of recommended students who their profile best match their own
        knowledge and skills. Students may choose to join a group.
        • Students can see list of projects that best match their knowledge and skills.
        • Student can choose to share their profiles with other students and academics.`,
        topics: ['Software Development', 'Web Application', 'Analytics and visualisation', 'Natural Language processing'],
        requiredSkills: ['Web Application', 'Web development', 'Testing frameworks and practices', 'Database design and management',
            'UI and UX principles', 'NLP techniques', 'Agile sofwtare development', 'Software testing, building and deployment'],
        outcomes: [`Project documentation including source code, system architecture and design, UI / UX,
            different types of testing, user manuals and guide, technical guide`,
            `Responsive Web application which is accessible on various devices, e.g., tablets and
            smartphones.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: `Tutor Management Web Platform`,
        description: `The goal of this project is to design and implement a web platform that connects students with
        tutors.It will help to facilitate one - on - one student tutoring appointments within private tutors.
        It involves browsing and selecting tutors, displaying tutors' profiles and expertise, scheduling
        tutorials with them and allowing them to communicate.`,
        scope: `The following describe the functional requirements of the web application:
        User roles: admin / system users, student user, tutor user
        • Admin users can manage user accounts and the platform.
        • Users with different roles and responsibilities can create their account, login and
        operate the system based on their roles and responsibilities.
        • Users can edit / maintain their profiles.
        • Signup and login: users can create or register their accounts and login using their
        account details.Users will have different permissions according to their roles.
        • Profiles: users can maintain their profiles.
        o Bother users should include their personal information, phone and address,
        time zone and bio.
        o Tutors should add professional bio and experience summary, and upload
        supporting documents such as qualifications and experience.
        o Tutors should be able to update and list the courses they are qualified to / can
    teach.They should be able to provide details of their teaching(e.g., topics,
        teaching approach)
        • Students can select courses they would like to get help with.
        • Students and tutors can search for tutors based on filters(e.g., course, time zone,
            location, rating)
        • Students can browse and filter tutors based on different filters such as time, location,
        rating, and courses / experience.
        • Students can check the availability of a tutor(their schedule).Students can choose to
        make an appointment with a tutor.A tutor will be notified and accept / reject it.
        Students get notified of the outcome through messaging and notifications.
        o Calendar Interface: Allow students to view tutors' availability on a calendar.
        o Scheduling: Enable students to select available time slots and request
        • Students can rate the tutor if they complete at least one appointment with them.
        • Tutors should see a dashboard of the allocated appointments, requests to approve, and
        access to important pages.
        • Students should see a dashboard showing their confirmed appointments.
        • Students and tutors can communicate through messaging within the application.
        • Tutors can modify the appointment details after discussing it with the student(via
        messaging)`,
        topics: ['Software Development', 'Web Application'],
        requiredSkills: ['Web Application', 'Frontend', 'Backend', 'Testing frameworks and practices', 'Database design and management',
            'UI and UX principles', 'Agile sofwtare development', 'Software testing, building and deployment'],
        outcomes: [`Project documentation including source code, system architecture and design, UI / UX,
        different types of testing, user manuals and guide, technical guide`,
            `Responsive Web application which is accessible on various devices, e.g., tablets and
    smartphones.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    var academic = await register('Ron', 'Fong', `RonFong@staff.unsw.edu.au`, 'Password123?', UserType.ACADEMIC)
    var academic = await getUId('RonFong@staff.unsw.edu.au')

    createProject({
        title: `Task Management Web Platform `,
        description: `The goal of this project is to design and develop a Web application that connects people who
        want to get some work or tasks to be completed (clients) with anyone who is willing to carry
        on the work/tasks (service taskers). `,
        scope: `The Web platform aims to facilitate various activities and interactions among clients and
        service taskers and thus allow them to complete work/tasks from the start to the end. The web
        application is responsive and accessible on mobile devices. The following describes the core
        requirements of the platform:
        Users
        • Administrator users have the full privilege in the system and should be able to manage
        and oversee the platform.
        • Users with different roles and responsibilities can create their account, login and
        operate the system based on their roles and responsibilities.
        • Users can edit/maintain their profiles.
        Client users:
        • Client users can register and create their accounts and login to the platform (following
        the standard registration way)
        • Clients can post details of the work that needs to be completed including title,
        description, categories, location, time, images, and frequency.
        • Clients can see dashboard highlighting the work/tasks they posted. They can choose
        to see details of any of these tasks.
        • Clients can see the details of each task and service tasker they bid on it.
        • Clients can communicate with any of the service taskers who bid on their task.
        • Clients can choose a service tasker to complete the task.
        • Clients and service taskers can update task status (in progress, completed).
        • Clients can rate their experience with the service tasker.
        • Clients can pay the service tasker (hypothetically)
        Service Taskers:
        • Service tasker users can create/register their account with the platform.
        • Service tasker users can edit and update their profile (e.g., personal info, skills)
        • Service tasker users can search and browse lists of available work/tasks with filters
        (e.g., location, time, description)
        • Service tasker user can view the details of a task and bid on it with a message.
        • Service tasker user can receive notification about the task allocation.
        • Service tasker can see dashboard of allocated tasks and its status.
        • Service tasker and client can communicate via a messaging system once a bid is
        accepted.
        • Service taskers can rate their experience with the work/task/client.
        • Service taskers receive the payment (hypothetically) one approved by the platform
        admin. `,
        topics: ['Software Development', 'Web Application'],
        requiredSkills: ['Web Application', 'Frontend', 'Backend', 'Testing frameworks and practices', 'Database design and management',
            'UI and UX principles', 'Agile sofwtare development', 'Software testing, building and deployment'],
        outcomes: [`Project documentation including source code, system architecture and design, UI / UX,
        different types of testing, user manuals and guide, technical guide`,
            `Responsive Web application which is accessible on various devices, e.g., tablets and smartphones.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)

    createProject({
        title: `Clippy: Smart PDF Reader For Better Paper Reading Experience And
        Knowledge Mining`,
        description: `Reading articles/papers is an everyday task for researchers. Improving researcher’s reading experience
        becomes essential so they can improve their productivity `,
        scope: `The development work should be based on the PDF reader based on PDF.js
        (https://mozilla.github.io/pdf.js/) to avoid reimplementing the PDF parsing logic and basic UI
        components. In addition, it is relatively easy to add new UI components to PDF.js to fulfill the
        needs of the features.
        The main functionalities of the paper reader are:
        • Resolving and presenting cross-references inside a paper
        When we read a paper, we often encounter this issue: A paragraph refers to a figure,
        but they are on different pages. When we read the paper, we will need to switch
        between the pages, which is quite troublesome. Similar cases apply for tables,
        citations, etc. To solve this problem, we propose to resolve the cross-references and
        display the corresponding subject (figure, table, citation, etc.) in a pop-up window or
        sidebar when the user hovers his/her mouse cursor over the cross-reference item (or
        when the user clicks the item but this will override the default behavior of PDF.js,
        which is jumping to the page of the referred subject).
        • Building a knowledge graph for the references of a paper
        A paper can cite many other papers, and the references often appear at the end of the
        paper as an independent section. The cited papers may also have citation/reference
        relations with each other. So this feature is to build a knowledge graph showing the
        citation relations of all the papers in the references section of the current paper. This
        can help to understand the relations between each work better.
        • Generating/mining summarizations for key components of the paper
        A paper can have several key components: abstract, background, related works, an
        overview of technique, experiment baselines, answers to research questions, etc. The
        reader should be able to generate/mine summarizations for these key components and
        highlight the key sentences in the PDF. An example is the TLDR feature of semantic
        scholar (https://www.semanticscholar.org/product/tldr). The summarization can help
        to improve reading efficiency.
        • Highlighting commonly used, topic-specific phrasings (optionally)
        A well-written paper should follow scientific writing styles. A paper can involve
        using many typical phrases/sentences for introduction, background description and
        experiment result analyses. Identifying and highlighting these sentences can help
        junior Ph.D. students or non-native English speakers to improve their writing skills.
        All development will happen in a GitHub repository. Any agile-like process is accepted, as
        long as it is adequately explained and motivated. Furthermore, the team needs to employ
        practices of clean code.
        The application should be based on PDF.js (https://mozilla.github.io/pdf.js/). The analysis of
        paper references can involve the usage of the semantic scholar API
        (https://www.semanticscholar.org/product/api).`,
        topics: ['Software Development', 'Web Application'],
        requiredSkills: ['PDF.js', 'API development', 'Web Application', 'Frontend', 'Backend', 'Testing frameworks and practices', 'Database design and management',
            'UI and UX principles'],
        outcomes: [`Project documentation including source code, system architecture and design, UI / UX,
            different types of testing, user manuals and guide, technical guide`,
            `Responsive Web application which is accessible on various devices, e.g., tablets and smartphones.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)


    createProject({
        title: `Web Platform for Connecting Professionals with Projects`,
        description: `The goal of this project is to design and develop a Web platform that connects companies
        offering projects with potentially interested individuals who are willing to carry on project
        work.`,
        scope: `Companies may create and choose to share projects with the public. Interested individuals
        (professionals) can search and request to join projects. The web application is responsive and
        accessible on mobile devices. The following are the core requirements that should be designed
        and implemented by the end of this project.
        Users
        • Administrator users have the full privilege in the system and should be able to manage
        and oversee the platform.
        • Users with different roles and responsibilities can create their account, login and
        operate the system based on their roles and responsibilities.
        • Users can edit/maintain their profiles.
        Company user
        • A company can create/register their account and login.
        • A company can edit their account by updating basic account information.
        • A company can create a new project by providing project information.
        • A company can view their project lists and its details (and filter it) and can edit any
        project information.
        • A company can approve/reject individuals requested to join the project.
        • A company can view/edit the list of professionals who are approved to join a project.
        • A company can view list of all available projects (project lists) and can choose to see
        the details of any project with filters.
        • A company can rate and recognize the participants who contributed to their projects at
        the end of the project.
        Professional user
        • A professional (individual looking to join projects) can create/register their account
        and login.
        • A professional can edit and update their account/project.
        • A professional can search and browse list of available projects and refine the results
        with search filters.
        • A professional can select to the view the full details of any project from the search
        results.
        • A professional can request to join/apply for a project of interest (this includes sharing
        relevant information from their profile)
        • A professional receive a notification of their request to join a project.
        • A profession can see the project page if they are approved by a company.
        • A professional can rate their experience with the project when the project is
        completed.
        • Upon successful completion, a professional can obtain certificate of recognition from
        the company offering the project.
        • Professional can browse list of achievements (completed projects and reviews).`,
        topics: ['Software Development', 'Web Application'],
        requiredSkills: ['Web Application', 'Frontend', 'Backend', 'Testing frameworks and practices', 'Database design and management',
            'UI and UX principles', 'Agile software development methods', 'Software testing, building and deployment'],
        outcomes: [`Project documentation including source code, system architecture and design, UI / UX,
            different types of testing, user manuals and guide, technical guide`,
            `Responsive Web application which is accessible on various devices, e.g., tablets and smartphones.`],
        maxGroupSize: 5,
        minGroupSize: 3,
        maxGroupCount: 5
    }, academic)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

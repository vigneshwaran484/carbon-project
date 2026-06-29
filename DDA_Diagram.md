# Detailed Design Architecture (DDA) Diagram

Below is the Mermaid code for the DDA (Detailed Design / Data Delivery Architecture) diagram of your CSR Banpasumai application. This captures the complete flow from your React frontend to the Express backend components and MongoDB database.

```mermaid
graph TD
    %% Frontend Components
    subgraph Client [Frontend - React App]
        UI([User Interface])
        AuthC[Auth Components]
        DashC[Dashboard & Analytics]
        ProjC[Projects & Energy Entry]
        RepC[Reports & EcoBot]
    end

    %% Backend Server
    subgraph Server [Backend - Express/Node.js]
        API{API Router}
        
        %% Routes
        AuthR[Auth Route]
        EnergyR[Energy Route]
        ProjR[Projects Route]
        RepR[Reports Route]
        InsightR[Insights & AI Route]
        LeadR[Leaderboard Route]
        
        %% Services & Middleware
        AuthMid(JWT Middleware)
        GroqAI((Groq SDK Engine))
        Mailer((Nodemailer / SMTP))
    end

    %% Database Models
    subgraph DB [Database - MongoDB]
        Users[(User Collection)]
        Energy[(Energy Collection)]
        Projects[(Project Collection)]
    end

    %% Client Interactions
    UI -->|Logins / Signups| AuthC
    UI -->|Views Stats| DashC
    UI -->|Data Entry| ProjC
    UI -->|AI Prompts / Exports| RepC

    %% API Requests
    AuthC -->|POST /auth| API
    DashC -->|GET /dashboard| API
    ProjC -->|GET/POST /projects & /energy| API
    RepC -->|GET/POST /reports & /ecobot| API

    %% Routing & Middleware
    API --> AuthMid
    AuthMid --> AuthR
    AuthMid --> EnergyR
    AuthMid --> ProjR
    AuthMid --> RepR
    AuthMid --> InsightR
    AuthMid --> LeadR

    %% DB Interactions (CRUD)
    AuthR <-->|Read / Write| Users
    EnergyR <-->|Read / Write| Energy
    ProjR <-->|Read / Write| Projects
    LeadR <-->|Reads| Users
    LeadR <-->|Reads| Energy

    %% External Services Integration
    InsightR <-->|Prompts & Summaries| GroqAI
    RepR -->|Send Emails| Mailer
```

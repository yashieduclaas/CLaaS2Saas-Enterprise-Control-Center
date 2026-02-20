1.  []{#_Toc214545407 .anchor}**Document Information**

  ------------------------------------------------------------------------------
  **Field**            **Details**
  -------------------- ---------------------------------------------------------
  **Document Title**   **Security Control Centre** (RBAC) Application

  **Document ID**      DOC-C2S-001

  **Current Version**  V1.6

  **Document Owner**   Rabiul Awal Hossain

  **Document Status**  Draft ~~/ In Review / Approved / Final~~

  **Classification**   Internal ~~/ Confidential / Public~~

  **Next Review Date** 
  ------------------------------------------------------------------------------

## **Version History**

  -----------------------------------------------------------------------------------------
  **Version**   **Date**     **Author**           **Changes      **Reviewed   **Approval
                                                  Made**         By**         Status**
  ------------- ------------ -------------------- -------------- ------------ -------------
  V1.1          26/11/2025   Rabiul Awal Hossain  Draft                       \<Pending
                                                                              /Approved\>

  V1.2          5/12/2025    Rabiul Awal Hossain  Review                      
                                                  comments                    
                                                  incorporated                

  V1.3          10/12/2025   Rabiul Awal Hossain  Re-organized                
                                                  based on IT                 
                                                  Framework                   
                                                  template                    

  V1.4          14/12/2025   Rabiul Awal Hossain  Updated with                
                                                  mockup screen               

  V1.5          19/12/2025   Rabiul Awal Hossain  Incorporated                
                                                  comments from               
                                                  Hassan and                  
                                                  updated screen              
                                                  design                      

                                                                              
  -----------------------------------------------------------------------------------------

## **Change Log**

  -----------------------------------------------------------------------------------
  **Change   **Version**   **Section    **Description of        **Rationale**
  ID**                     Modified**   Change**                
  ---------- ------------- ------------ ----------------------- ---------------------
  CH-001                                                        

  CH-002                                                        

  CH-003                                                        

  CH-004                                                        
  -----------------------------------------------------------------------------------

## **Distribution List**

  ------------------------------------------------------------------------------
  **Name**   **Role**            **Department**          **Version**   **Date
                                                                       Sent**
  ---------- ------------------- ----------------------- ------------- ---------
                                                                       

                                                                       
  ------------------------------------------------------------------------------

## Approval Signatures

  ----------------------------------------------------------------------------------
  **Role**       **Name**             **Signature**   **Date**
  -------------- -------------------- --------------- ------------------------------
  **Author**     Rabiul Awal Hossain                  

  **Reviewer**                                        

  **Approver**                                        
  ----------------------------------------------------------------------------------

# Table of Contents {#table-of-contents .unnumbered}

[1. Document Information [1](#_Toc214545407)](#_Toc214545407)

[1.1 Version History [1](#version-history)](#version-history)

[1.2 Change Log [2](#change-log)](#change-log)

[1.3 Distribution List [2](#distribution-list)](#distribution-list)

[1.4 Approval Signatures
[2](#approval-signatures)](#approval-signatures)

[Table of Contents [2](#table-of-contents)](#table-of-contents)

[1. Introduction [3](#introduction)](#introduction)

[1.1 Background [4](#background)](#background)

[1.2 Purpose [4](#purpose)](#purpose)

[1.3 Stakeholders & Users [4](#stakeholders-users)](#stakeholders-users)

[1.4 Glossary [4](#glossary)](#glossary)

[2.0 Application Requirements & Scoping
[5](#application-requirements-scoping)](#application-requirements-scoping)

[2.1 Scope [6](#scope)](#scope)

[2.2 Out of Scope [6](#out-of-scope)](#out-of-scope)

[2.3 Power App Plan Approach
[6](#power-app-plan-approach)](#power-app-plan-approach)

[2.3.1 SOP Details [6](#sop-details)](#sop-details)

[2.3.2 Feature Listing Summary
[9](#feature-listing-summary)](#feature-listing-summary)

[3 Application Specifications
[10](#application-specifications)](#application-specifications)

[3.1 Functional Specifications
[10](#functional-specifications)](#functional-specifications)

[3.2 Functional Requirements [11](#functional-flows)](#functional-flows)

[3.3 Functional Fow [11](#functional-fow)](#functional-fow)

[3.4 End-to-End Process flow Diagram
[12](#end-to-end-process-flow-diagram)](#end-to-end-process-flow-diagram)

[4.0 Data and Integration Specifications
[13](#data-and-integration-specifications)](#data-and-integration-specifications)

[4.1 Architecture Layers
[13](#architecture-layers)](#architecture-layers)

[4.3 Detailed Design -- Security Center for RBAC
[13](#detailed-design-security-center-for-rbac)](#detailed-design-security-center-for-rbac)

[4.4 Data Specifications
[14](#data-specifications)](#data-specifications)

[4.5 Table design for Audit log management
[17](#table-design-for-audit-log-management)](#table-design-for-audit-log-management)

[4.5.1 Table: SecurityDB_Audit_Session
[17](#table-securitydb_audit_session)](#table-securitydb_audit_session)

[4.5.2 Table: SecurityDB_Audit_Action_Log
[18](#table-securitydb_audit_action_log)](#table-securitydb_audit_action_log)

[4.6 Entity Relationship Diagram (including audit log tables)
[18](#entity-relationship-diagram-including-audit-log-tables)](#entity-relationship-diagram-including-audit-log-tables)

[5.0 UI/UX and Accessibility
[19](#uiux-and-accessibility)](#uiux-and-accessibility)

[5.1 Security Control Centre Hub
[19](#security-control-centre-hub)](#security-control-centre-hub)

[5.2 Module Management screen
[22](#module-management-screen)](#module-management-screen)

[5.3 User Management screen for profile enrichment
[23](#user-management-screen-for-profile-enrichment)](#user-management-screen-for-profile-enrichment)

[5.4 Security Role Management
[24](#security-role-management)](#security-role-management)

[5.5 Security User Role Assignment
[25](#security-user-role-assignment)](#security-user-role-assignment)

[5.6 Audit Log viewing UI
[28](#audit-log-viewing-ui)](#audit-log-viewing-ui)

[6.0 Security Role & Permission Model
[31](#security-role-permission-model)](#security-role-permission-model)

[6.1 Defining Permission
[31](#defining-permission)](#defining-permission)

[6.2 Defining Role (Admin, Collaborator, Contributor, Viewer, Global
Admin) and Permission mapping
[32](#defining-role-admin-collaborator-contributor-viewer-global-admin-and-permission-mapping)](#defining-role-admin-collaborator-contributor-viewer-global-admin-and-permission-mapping)

[6.3 User Security Role Assignment Process
[32](#user-security-role-assignment-process)](#user-security-role-assignment-process)

[6.4 Workflow Automation
[33](#workflow-automation)](#workflow-automation)

[6.4.1 User Provisioning Automator
[33](#user-provisioning-automator)](#user-provisioning-automator)

[6.4.2 Audit Action Analytics
[33](#audit-action-analytics)](#audit-action-analytics)

[6.4.3 RBAC Interactive Analyst
[33](#rbac-interactive-analyst)](#rbac-interactive-analyst)

[7. Security, Governance & Operations
[33](#security-governance-operations)](#security-governance-operations)

[8. Testing and Quality Assurance
[33](#testing-and-quality-assurance)](#testing-and-quality-assurance)

[9. Application Deployment & Release Management
[33](#application-deployment-release-management)](#application-deployment-release-management)

[10. Application Management & Support
[34](#application-management-support)](#application-management-support)

[11. KPIs & Risk Management
[34](#kpis-risk-management)](#kpis-risk-management)

[12. Future Enhancements
[34](#future-enhancements)](#future-enhancements)

# 1. Introduction {#introduction .unnumbered}

This document defines the requirements and solution design for a
Role-Based Access Control (RBAC) application to be implemented as a
Security Kernel on Microsoft Power Platform and Dataverse, with
Microsoft Entra ID (Azure AD) as the first layer of authentication. The
RBAC solution will provide centralized, consistent, and auditable access
control across CLaaS2SaaS Modules such as CLaaS Manager, CLaaS Mentor,
and future modules.

## 1.1 Background {#background .unnumbered}

Currently, access to new CLaaS2SaaS Modules is not centrally governed.
Most Modules provide full access to all users by default, while a few
enforce their own isolated access controls. This fragmented approach
results in inconsistent permission models, limited auditability, and an
increased administrative workload. To support organizational growth,
standardize security practices, and ensure compliance, CLaaS2SaaS
requires a centralized **Security Kernel** that serves as the single
source of truth for user identities, roles, and permissions across all
Modules.

## 1.2 Purpose {#purpose .unnumbered}

The purpose of this document is to specify the business requirements and
describe the end-to-end solution design for the Security Control Centre,
covering authentication, eligibility validation, role management,
permission evaluation, and integration patterns with Power Platform
Modules.

## 1.3 Stakeholders & Users {#stakeholders-users .unnumbered}

-   Platform Collaborator / Architects -- define security patterns and
    ensure consistency.

-   Solutions Collaborator (CLaaS Manager, CLaaS Mentor, etc.) --
    configure permissions for their apps.

-   System Admins / Security Admins -- manage roles and user
    assignments.

-   End Users (Learners, Mentors, Staff, Partners) -- consume the
    Modules with appropriate access.

## 1.4 Glossary {#glossary .unnumbered}

  ---------------------------------------------------------------------------
  Term             Definition
  ---------------- ----------------------------------------------------------
  RBAC             Role-Based Access Control, a security model where user
                   access to system functionality is determined by assigned
                   roles and mapped permissions.

  SCC              Security Control Centre for centralized identity and
                   permission governance.

  Entra ID         Microsoft identity service for authentication and SSO.

  Dataverse        Data platform storing SCC metadata such as roles,
                   permissions, audits.

  SSO (Single      Authentication mechanism allowing users to access multiple
  Sign-On)         applications using a single Entra ID login.

  JWT (JSON Web    A secure token issued by Entra ID after authentication,
  Token)           used to validate user identity and claims

  SoD              Segregation of Duties. A governance principle preventing
                   conflicting roles or permissions from being assigned to
                   the same user.

  MoSCoW           A requirement prioritization technique classifying
  Prioritization   features as Must, Should, Could, or Won't Have.
  ---------------------------------------------------------------------------

-   

# 2.0 Application Requirements & Scoping {#application-requirements-scoping .unnumbered}

## 2.1 Scope {#scope .unnumbered}

-   **ClaaS2SaaS Security Control Center** is planned to implement using
    Dataverse tables (SecurityDB_SECURITY_USER,
    SecutityDB_SECURITY_ROLE, SecutityDB_SECURITY_USER_ROLE,
    SecutityDB_SECURITY_PERMISSION,
    SecutityDB_SECURITY_ROLE_PERMISSION).

-   Integration with Microsoft Entra ID for single sign-on (SSO)
    authentication.

-   Automatic population user records in SECURITY_USER upon first time
    assignment of roles to users by module Admin using Entra Object ID
    as primary key.

-   Support for generic RBAC roles: Viewer, Contributor, Collaborator,
    Admin, Global Admin.

-   Module-wise permissions that control access to actions.

-   Reusable APIs for Procode and Power Platform apps to query roles and
    permissions.

## 2.2 Out of Scope {#out-of-scope .unnumbered}

-   Detailed UI/UX design of individual business modules (e.g., CLaaS
    Manager screens).

-   Complex context-based or data-level permissions (row-level security
    per record).

-   Full audit logging and reporting (to be handled in a later phase).

-   Conditional access policies and MFA configuration (managed in
    Microsoft Entra ID).

## 2.3 Power App Plan Approach  {#power-app-plan-approach .unnumbered}

## 2.3.1 SOP Details  {#sop-details .unnumbered}

  --------------------------------------------------------------------------------------------------------------------------------
  **1.0**    **Authentication &                                                                          
             Identity**                                                                                  
  ---------- ------------------ --------------- ---------------- --------------------- ----------------- -------------------------
  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  1.1        Authenticate user  End User, Entra Every login      Redirect to Entra ID  Entra ID SSO      Enables secure login
             via Microsoft      ID                               → Validate            Login             using Entra ID and
             Entra ID                                            credentials → Return                    retrieves identity claims
                                                                 JWT                                     

  1.2        Validate JWT token SCC Auth Engine Immediately      Verify signature →    Token Validation  Ensures only valid tokens
                                                after SSO        extract metadata →    Engine            and identities can access
                                                                 validate claims                         SCC

  1.3        Detect first-time  SCC Engine      Every login      Check entra_object_id First-Time User   Identifies new users and
             user login                                          in SecurityDB_User    Onboarding        triggers provisioning
                                                                                                         flow

  **2.0**    **SCC User                                                                                  
             Provisioning &                                                                              
             Profile                                                                                     
             Management**                                                                                

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  2.1        Create user record Provisioning    On first role    Create Dataverse      Automated User    Automatically creates and
             in DB              Automator       assignment       record & sync fields  Provisioning      activates user profiles

  2.3        Activate or        Global Admin    During role      Set is_active flag,   User Lifecycle    Controls user
             deactivate user                    updates          audit change          Management        activation/deactivation
                                                                                                         automatically

  **3.0**    **Role                                                                                      
             Management**                                                                                

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  3.1        Create new role    Global Admin    Module           Define role metadata  RBAC Role         Allows creation &
             for                                onboarding       and map module        Management        maintenance of system and
             solution/module                                                                             module roles

  3.2        Track role changes Global Admin    RBAC update      Update version        Role Lifecycle    Ensures safe deactivation
             and deactivate                     cycles           metadata, disable     Management        and governance
             roles                                               roles                                   

  **4.0**    **Permission                                                                                
             Management**                                                                                

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  4.1        Define permissions Admin, Global   During module    Create permission     Permission        Central repository of
             for modules        Admin           onboarding       entries               Catalogue         functional permissions
                                                                                       Management        

  4.2        Map permissions to Global Admin    After permission Assign CRUD flags +   Permission        Controls granular
             roles                              creation         privilege flags       Assignment Engine role-based permissions

  **5.0**    **User-Role                                                                                 
             Assignment**                                                                                

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  5.1        Assign roles to    Global Admin    On access        Create User_Role      User-Role         Grants access to modules
             users                              request approval mapping               Assignment        through roles

  5.2        Bulk assign roles  Global Admin    Mass onboarding  CSV import automation Bulk Access       Supports batch
                                                                                       Assignment        provisioning

  **6**      **Module &                                                                                  
             Solution                                                                                    
             Registry**                                                                                  

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  6.1        Register solutions Global Admin    Solution         Create                Solution          Maintains central
             metadata                           onboarding       SecurityDB_Solution   Registration      application catalog
                                                                 entry                                   

  6.2        Register modules   Global Admin    Module           Create                Module            Maintains metadata for
             under solutions                    onboarding       Solution_Module entry Registration      module owner/version

  **7**      **Audit Logging**                                                                           

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  7.1        Log login attempts SCC Runtime     Every login      Create Audit_Session  Session Audit     Authentication & Identity
                                                                 entry                                   Features

  7.2        Log CRUD +         SCC Runtime     Every action     Write to Audit_Action Action Audit      Maintains traceability
             permission actions                                                                          for compliance

  **8**      **Admin UI                                                                                  
             Features (**                                                                                

  **Step**   **Feature**        **Feature       **Activities**   **Who**               **When**          **How**
                                Description**                                                            

  8.1        SCC Dashboard      Provides        Display SCC      Admins                Continuous        Power Apps dashboard
                                visibility on   metrics                                                  
                                access, roles,  dashboard                                                
                                logs                                                                     

  **9**      **AI / Copilot                                                                              
             Features (to                                                                                
             explore further)**                                                                          

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  9.1        AI-based RBAC      Copilot         On demand        Analyze User_Role &   RBAC Insight      Explains why users have
             query                                               Role_Permission graph Agent             access to modules

  9.1        AI-based RBAC      Copilot         On demand        Assist user to apply  RBAC Insight      Ask user on the role they
             query                                               role                  Agent             want and submit to access
                                                                                                         request to supervisor for
                                                                                                         approval

  **10**     **Governance &                                                                              
             Compliance                                                                                  
             Features (to be                                                                             
             explored                                                                                    
             further)**                                                                                  

  **Step**   **Activities**     **Who**         **When**         **How**               **Feature**       **Feature Description**

  10.1       Perform quarterly  Admin, Global   Quarterly        Generate and validate Access            Ensures RBAC compliance
             access review      Admin                            access report         Recertification   

  10.2       Detect conflicting Gov. Engine     During           Run SoD rules         SoD Compliance    Prevents conflicting
             roles                              assignment &                           Engine            access combinations
                                                audits                                                   
  --------------------------------------------------------------------------------------------------------------------------------

## 2.3.2 Feature Listing Summary {#feature-listing-summary .unnumbered}

  --------------------------------------------------------------------------------
  **Feature#**   **High Level Feature**           **Feature Description**
  -------------- -------------------------------- --------------------------------
  1              Authentication & Identity        
                 Features                         

  2              User Provisioning & Profile      
                 Management                       

  3              Role Management Features         

  4              Permission Management Features   

  5              User-Role Assignment Features    

  6              Audit Logging Features           

  7              Admin UI Features                

  8              AI / Copilot Features            

  9              Governance & Compliance Features 

  10             Module & Solution Registry       
  --------------------------------------------------------------------------------

### 2.3.3 Scope **MoSCoW matrix** that **for Application Requirements & Scoping.**  {#scope-moscow-matrix-that-for-application-requirements-scoping. .unnumbered}

  -------------------------------------------------------------------------------------------
  **MoSCoW Feature       **Feature Area** **Feature**             **Rationale**
  Prioritisation**                                                
  ---------------------- ---------------- ----------------------- ---------------------------
  1\. Must Have (MVP /   Authentication & Entra ID SSO Login      Core authentication layer;
  Compliance-Critical)   Identity                                 no local auth allowed

                         Authentication & JWT Token Validation    Prevents unauthorized
                         Identity         Engine                  access

                         User             Automated User          Eliminates manual user
                         Provisioning     Provisioning            creation; ensures
                                                                  scalability

                         Role Management  RBAC Role Management    Core RBAC capability

                         Permission       Permission Catalogue    Central definition of
                         Management       Management              permissions

                         User Access      User--Role Assignment   Grants access to modules

                         Module Registry  Solution and Module     Required for module-level
                                          Registration            RBAC

                         Audit (Basic)    Session Audit Logging   Required for traceability &
                                                                  security

  2\. Should Have (High  User Management  User Lifecycle          Improves governance
  Value, Post-MVP)                        Management              
                                          (Activate/Deactivate)   

                         Audit            Action Audit Logging    Stronger compliance &
                                                                  forensics

                         UI / UX          SCC Dashboard (Metrics  Admin insight & monitoring
                                          & Visibility)           

                         Reporting        Audit Log Viewing UI    Operational and compliance
                                                                  review

                         Analytics        Audit Action Analytics  Advanced insights
                                          Dashboard               

  3\. Could Have         Access           Bulk Role Assignment    Operational efficiency
  (Nice-to-Have)         Management                               

                         AI / Copilot     RBAC Insight Agent      Explainability & admin
                                                                  assistance

                         Automation       Rule-Based Auto Role    Reduces admin workload
                                          Assignment              

                         UX               Self-Service Access     Improves user experience
                                          Requests                

                         Governance       Temporary / Time-Bound  Event-based access control
                                          Roles                   

  4\. Won't Have (This   Security         Conditional Access      Managed in Entra ID
  Release)                                Policies                

                         Security         MFA Configuration       Out of SCC scope

                         Data Security    Row-Level Security      Deferred to future
                                          (RLS)                   enhancement

                         Governance       SoD Compliance Engine   Prevents toxic role
                                                                  combinations
  -------------------------------------------------------------------------------------------

#  {#section .unnumbered}

# 3 Application Specifications {#application-specifications .unnumbered}

## 3.1 Functional Specifications {#functional-specifications .unnumbered}

+-------------+--------------------------------------------------------+
| R           | Description                                            |
| equirement# |                                                        |
+=============+========================================================+
| BR-01       | The organization shall have a single, central          |
|             | repository for user security and RBAC information.     |
+-------------+--------------------------------------------------------+
| BR-02       | Authentication must be handled by Microsoft Entra ID   |
|             | with no local password management.                     |
+-------------+--------------------------------------------------------+
| BR-03       | User provisioning into the Security Control Center     |
|             | shall be automatic upon first time assignment of role  |
| (Revisit    | (no manual data entry). User profile will be enriched  |
| the logic   | later using manual or automated process as needed.     |
| later)      |                                                        |
+-------------+--------------------------------------------------------+
| BR-04       | Access to module features shall be strictly            |
|             | role-based, with clear separation between Viewer,      |
|             | Contributor, Collaborator, Admin and Global Admin      |
|             | capabilities.                                          |
+-------------+--------------------------------------------------------+
| BR-05       | Module Admin shall be able to adjust role-permission   |
|             | mappings and assignment of role to users including     |
|             | master data maintenance for the module                 |
+-------------+--------------------------------------------------------+
| BR-06       | Permission will be granted to various roles as below:  |
|             |                                                        |
|             | Viewer: View all module data                           |
|             |                                                        |
|             | Contributor: CRUD to own Data and Read access for all  |
|             | except Admin and master data.                          |
|             |                                                        |
|             | Collaborator: CRUD to All Data and approving           |
|             | privileges                                             |
|             |                                                        |
|             | Admin: CRUD to All Data for individual module, access  |
|             | for the assignment of role and permission management   |
|             | and Master data management                             |
|             |                                                        |
|             | Global Admin: View all module data and access of admin |
|             | role for the assignment of role and permission         |
|             | management and Master data management.                 |
+-------------+--------------------------------------------------------+
| BR-07       | System must have provision to store the logs **every   |
|             | major action** performed by users and timing during    |
|             | their session to track the functions usage.            |
+-------------+--------------------------------------------------------+

## 3.2 Functional Flows {#functional-flows .unnumbered}

  -----------------------------------------------------------------------
  **Functional       **Description**
  Requirement**      
  ------------------ ----------------------------------------------------
  FR-01              The system shall authenticate all users through
                     Microsoft Entra ID using SSO.

  FR-02              On successful login, the system shall read the Entra
                     Object ID and email from the token.

  FR-03              The system shall check the SEC_USER table for a
                     matching Entra Object ID.

  FR-05              If the user exists, the system shall update the
                     LastLoginDate field.

  FR-06              The system shall store one or more role assignments
                     per user in AIW_SECURITY_USER_ROLE.

  ~~FR-07~~          ~~The system shall store permissions for each
                     security role in table: AIW_SECURITY_PERMISSION &
                     AIW_SECURITY_ROLE_PERMISSION.~~

  FR-08              For each protected action, the application shall
                     check if the user has the required permission.

  FR-09              The system shall allow Security Admins to activate
                     or deactivate user roles without deleting history.

  FR-10              The system shall implement a generic permission
                     check routine that can be reused across apps.
  -----------------------------------------------------------------------

## 3.3 Functional Fow {#functional-fow .unnumbered}

![A diagram of a security centre Description automatically
generated](media/image1.png){width="6.479444444444445in"
height="3.693432852143482in"}

## 3.4 End-to-End Process flow Diagram {#end-to-end-process-flow-diagram .unnumbered}

![A diagram of a security control centre Description automatically
generated](media/image2.png){width="7.276090332458443in"
height="4.073431758530184in"}

# 4.0 Data and Integration Specifications {#data-and-integration-specifications .unnumbered}

## 4.1 Architecture Layers {#architecture-layers .unnumbered}

The Security RBAC solution is structured into three primary layers:

![A screen shot of a computer Description automatically
generated](media/image3.png){width="7.0286701662292215in"
height="4.462879483814524in"}

## 4.3 Detailed Design -- Security Center for RBAC {#detailed-design-security-center-for-rbac .unnumbered}

To keep the structure clear and maintainable, all tables will have below
standard audit fields:

-   created_at -- when the record was created

-   created_by --user who created it

-   updated_at -- when the record was last updated

-   updated_by --user who updated it

-   archived_at -- when it was archived

-   archived_by -- who archived it

-   Deleted_flag - if deleted (soft delete)

-   order_index -- optional number to control display order in the UI

## 4.4 Data Specifications  {#data-specifications .unnumbered}

The following entities are used to implement the RBAC model. They
correspond to the ERD shared for the Security Kernel Module.

+----------------------+-----------------------------------------------+
| Entity Name          | Description                                   |
+======================+===============================================+
| **SecurityD          | Store solution -- module listing. Example:    |
| B\_**Solution-Module |                                               |
|                      | Adaptive ClaaS -- Developer                   |
|                      |                                               |
|                      | Adaptive ClaaS -- Manager                     |
|                      |                                               |
|                      | Adaptive ClaaS -- Mentor                      |
|                      |                                               |
|                      | This table is denormalized to combine         |
|                      | Solution and Module table considering both    |
|                      | Solutions and Modules table will contain      |
|                      | small number of records.                      |
+----------------------+-----------------------------------------------+
| **Securit            | Store additional user details like Business   |
| yDB**\_Security-User | roles and security tokens to store JWT token  |
|                      | for application access.                       |
|                      |                                               |
|                      | SSO Entra ID -- Srikanth - Product Director - |
|                      | JWT_Access_Token                              |
|                      |                                               |
|                      | SSO Entra ID - AL Jessica - Product           |
|                      | Evaluator - \<JWT for user-solution- module - |
|                      | access\>                                      |
|                      |                                               |
|                      | Security token will be generated with module  |
|                      | access details (Userid, session, Solution,    |
|                      | module, role assigned to users). This JWT     |
|                      | token will be regenerated and overridden in   |
|                      | SecurityDB_Security_User table prior expiry.  |
|                      |                                               |
|                      | **Sample Security Token:**                    |
|                      |                                               |
|                      | {                                             |
|                      |                                               |
|                      | \"iss\":                                      |
|                      | \"[https://login.micros                       |
|                      | oftonline.com/{tenant-id}/v2.0](https://login |
|                      | .microsoftonline.com/%7btenant-id%7d/v2.0)\", |
|                      |                                               |
|                      | \"aud\": \"api://kernel-apps\",               |
|                      |                                               |
|                      | \"sub\": \"<rabiul.hossain@gmail.com>\",      |
|                      |                                               |
|                      | \"email\": \"<rabiul.hossain@gmail.com>\",    |
|                      |                                               |
|                      | \"name\": \"Rabiul Awal Hossain\",            |
|                      |                                               |
|                      | \"iat\": 1734510000,                          |
|                      |                                               |
|                      | \"exp\": 1734513600,                          |
|                      |                                               |
|                      | \"roles\": \[                                 |
|                      |                                               |
|                      | {                                             |
|                      |                                               |
|                      | \"solution\": \"ADC\",                        |
|                      |                                               |
|                      | \"module\": \"AGNT_HR\",                      |
|                      |                                               |
|                      | \"access\": \"ADMIN\"                         |
|                      |                                               |
|                      | },                                            |
|                      |                                               |
|                      | {                                             |
|                      |                                               |
|                      | \"solution\": \"ADC\",                        |
|                      |                                               |
|                      | \"module\": \"AGNT_TLNT\",                    |
|                      |                                               |
|                      | \"access\": \"CONTRIBUTOR\"                   |
|                      |                                               |
|                      | },                                            |
|                      |                                               |
|                      | {                                             |
|                      |                                               |
|                      | \"solution\": \"AIW\",                        |
|                      |                                               |
|                      | \"module\": \"ECC\",                          |
|                      |                                               |
|                      | \"access\": \"ADMIN\"                         |
|                      |                                               |
|                      | }                                             |
|                      |                                               |
|                      | \],                                           |
|                      |                                               |
|                      | \"auth_source\": \"EntraID\",                 |
|                      |                                               |
|                      | \"token_type\": \"access_token\"              |
|                      |                                               |
|                      | }                                             |
+----------------------+-----------------------------------------------+
| **SecurityDB**\_Secu | Store security roles                          |
| rity-Role_Permission |                                               |
|                      | **[Solutions]{.underline}**                   |
|                      | **[Module]{.underline}**                      |
|                      | **[Role]{.underline}**                        |
|                      |                                               |
|                      | Adaptive CLaaS Developer Admin                |
|                      |                                               |
|                      | Adaptive CLaaS Developer Contributor          |
|                      |                                               |
|                      | **[Security Role]{.underline}**               |
|                      | **[Permission]{.underline}**                  |
|                      |                                               |
|                      | Admin CRUD to all Data + Admin MDM            |
|                      |                                               |
|                      | Collabrator CRUD to all Data                  |
|                      |                                               |
|                      | Contributor CRUD to Own data and R to all     |
|                      |                                               |
|                      | other information except Admin MDM            |
|                      |                                               |
|                      | Viwer Read to all other information except    |
|                      | Admin                                         |
|                      |                                               |
|                      | MDM                                           |
+----------------------+-----------------------------------------------+
| **SecurityDB**       | Store Security Role assigned to individual    |
| \_Security-User-Role | users                                         |
|                      |                                               |
|                      | **[User Solution Module Security              |
|                      | Role]{.underline}**                           |
|                      |                                               |
|                      | SSO Entra ID user1 Adaptive CLaaS Developer   |
|                      | Collabrator                                   |
|                      |                                               |
|                      | SSO Entra ID user2 Adaptive CLaaS Developer   |
|                      | Viwer                                         |
|                      |                                               |
|                      | SSO Entra ID user3 Adaptive CLaaS Developer   |
|                      | Admin                                         |
|                      |                                               |
|                      | SSO Entra ID user4 Adaptive CLaaS Manager     |
|                      | Collabrator                                   |
|                      |                                               |
|                      | SSO Entra ID user5 Adaptive CLaaS Manager     |
|                      | Contributor                                   |
+----------------------+-----------------------------------------------+
| **Securit            | Store audit session log                       |
| yDB**\_Audit-Session |                                               |
+----------------------+-----------------------------------------------+
| **SecurityDB         | Store audit action log                        |
| **\_Audit-Action-Log |                                               |
+----------------------+-----------------------------------------------+

### 4.4.1 Table: SecurityDB_Solution-Module {#table-securitydb_solution-module .unnumbered}

+-----------------+------------+---------------------------+----------+
| Column          | Type       | Description               | Field    |
|                 |            |                           | va       |
|                 |            |                           | lidation |
+=================+============+===========================+==========+
| Sol             | unique     | Unique identifier.        | Not Null |
| ution_module_id | identifier |                           |          |
| (PK)            |            |                           |          |
+-----------------+------------+---------------------------+----------+
| solution_code   | v          | Solution Code             | Not Null |
|                 | archar(10) |                           |          |
|                 |            | (AIW, ADC, ACM & AES)     |          |
+-----------------+------------+---------------------------+----------+
| solution_name   | va         | 1\. Agentic Intelligent   | Not Null |
|                 | rchar(255) | Workplace (AIW)           |          |
|                 |            |                           |          |
|                 |            | 2\. Adaptive CLaaS (ADC)  |          |
|                 |            |                           |          |
|                 |            | 3\. Agentic CRM &         |          |
|                 |            | Marketer (ACM)            |          |
|                 |            |                           |          |
|                 |            | 4\. Agentic ERP & Shared  |          |
|                 |            | Services (AES)            |          |
+-----------------+------------+---------------------------+----------+
| module_code     | v          | Module Code               | Not Null |
|                 | archar(10) |                           |          |
+-----------------+------------+---------------------------+----------+
| module_name     | Va         | CLaaSManager,             | Not Null |
|                 | rchar(255) | CLaaSMentor,              |          |
|                 |            | CLaaSDeveloper etc.       |          |
+-----------------+------------+---------------------------+----------+
| Description     | Text(255)  | Description of module     | Not Null |
+-----------------+------------+---------------------------+----------+
| module_lead     | Va         | Module lead (Name)        |          |
| (optional)      | rchar(100) |                           |          |
+-----------------+------------+---------------------------+----------+
| do              | Va         | linked to                 |          |
| cumentation_url | rchar(255) |                           |          |
| (optional)      |            |                           |          |
+-----------------+------------+---------------------------+----------+
| module_version  | Va         |                           |          |
| (released       | rchar(255) |                           |          |
| version)        |            |                           |          |
| (optional)      |            |                           |          |
+-----------------+------------+---------------------------+----------+

### 4.4.2 Table: OrganizationDB_Security-User {#table-organizationdb_security-user .unnumbered}

+----------------+-------------+---------------------------+----------+
| Column         | Type        | Description               | Field    |
|                |             |                           | va       |
|                |             |                           | lidation |
+================+=============+===========================+==========+
| user_id (FK)   | uniqu       | Unique user identifier.   | Not Null |
|                | eidentifier |                           |          |
|                |             | Entra ID is email ID used |          |
|                |             | as technical key and      |          |
|                |             | unique key                |          |
+----------------+-------------+---------------------------+----------+
| entra_email_id | uniqu       | Entra ID email ID used as | Not Null |
| (UK)           | eidentifier | technical key.            |          |
|                | / varchar   |                           |          |
+----------------+-------------+---------------------------+----------+
| ~~user_name    | ~~var       | ~~Login~~                 | ~~Not    |
| (UK)~~         | char(255)~~ |                           | Null~~   |
+----------------+-------------+---------------------------+----------+
| Display_name   | v           | Full name of the user.    | Not Null |
|                | archar(255) |                           |          |
+----------------+-------------+---------------------------+----------+
| Org_role       | v           | Organizational Role of    | Not Null |
|                | archar(255) | user                      |          |
+----------------+-------------+---------------------------+----------+
| Ma             | v           | Manager email id; Entra   |          |
| nager_email_id | archar(255) | ID                        |          |
| (optional)     |             |                           |          |
|                |             | Of manager                |          |
+----------------+-------------+---------------------------+----------+
| Manager_name   | v           | Manager Name              |          |
| (Optional)     | archar(255) |                           |          |
+----------------+-------------+---------------------------+----------+
| is_active      | Bit         | Indicates whether the     | De       |
|                |             | user account is active    | fault(0) |
|                |             | (1) or inactive (0).      |          |
+----------------+-------------+---------------------------+----------+
| JW             | JWTI        | User access detail will   |          |
| T_Access_Token |             | be stored. Json Web Token |          |
|                |             | Identifier                |          |
+----------------+-------------+---------------------------+----------+

###  {#section-1 .unnumbered}

### 4.4.3 Table: SecurityDB_Security-Role-Permission  {#table-securitydb_security-role-permission .unnumbered}

  ---------------------------------------------------------------------------------------
  Column                                Type               Description       Field
                                                                             validation
  ------------------------------------- ------------------ ----------------- ------------
  Sec_role_Id                           uniqueidentifier                     Not Null

  Sec_role_code (UK)                    varchar(50)        System code       Not Null
                                                           (ADMIN,           
                                                           COLLABORATOR,     
                                                           CONTRIBUTOR,      
                                                           VIEWER).          

  Sec_role_name                         varchar(100)       Human-readable    Not Null
                                                           name (Admin,      
                                                           Collaborator,     
                                                           Contributor,      
                                                           Viewer, etc.).    

  Solution_module_id (FK)               Uniqueidentifier                     Not Null

  Security_token                        varchar(100)       Security Token to Not Null
                                                           be passed to      
                                                           invoke the module 

  IsSystemRole                          Boolean            Indicates         Not Null
                                                           built-in system   
                                                           role (1) or       
                                                           custom role (0).  

  Create_permission                     Boolean            0/1               Not Null

  Read_permission                       Boolean            0/1               Not Null

  Update_permission                     Boolean            0/1               Not Null

  Delete_permission                     Boolean            0/1               Not Null

  View_all_user_data                    Boolean            0/1               Not Null

  View_all_data_plus_admin_for_module   Boolean            0/1               Not Null

  View_all_data_plus_admin_for_all      Boolean            0/1               Not Null
  module                                                                     

  IsActive                              Boolean            Indicates whether Not Null
                                                           the grant is      
                                                           active (1) or     
                                                           inactive (0).     
  ---------------------------------------------------------------------------------------

### 4.5.6 Table: SecurityDB_Security_User_Role {#table-securitydb_security_user_role .unnumbered}

  ------------------------------------------------------------------------------
  Column             Type                   Description        Field validation
  ------------------ ---------------------- ------------------ -----------------
  entra_email_id     uniqueidentifier /     Entra ID Object ID Not Null
                     varchar                used as technical  
                                            key.               

  Solution_id        Uniqueidentifier(FK)   Solution Id in     Not Null
                                            which role is      
                                            defined for        

  Module_id          Uniqueidentifier(FK)   Module Id in which Not Null
                                            role is defined    
                                            for                

  SecRoleID (FK)     uniqueidentifier       Link to            Not Null
                                            SEC_ROLE.RoleID.   

  AssignedDate       datetime2              When the role was  Not Null
                                            assigned.          

  AssignedByUserID   uniqueidentifier       Who assigned the   Not Null
                                            role (admin user   
                                            ID).               

  Reason             varchar(255)           Reason for         Null
                                            assignment or      
                                            promotion.         

  IsActive           Boolean                Indicates whether  Not Null
                                            the assignment is  
                                            active (1) or      
                                            historical (0).    

  Disabled_date      datetime2              When user role     Null
                                            assignment is      
                                            deactivated        
  ------------------------------------------------------------------------------

## 4.5 Table design for Audit log management  {#table-design-for-audit-log-management .unnumbered}

The following entities are used to implement the audit log management.
Below are a recommended audit log tables structure designed specifically
for capturing:

-   User session activity

-   Object-level CRUD changes

-   Old vs new data values

## 4.5.1 Table: SecurityDB_Audit_Session {#table-securitydb_audit_session .unnumbered}

Record when users access the system, their context, and which
application modules they interacted with.

  ----------------------------------------------------------------------------------
  **Column**           **Type**           **Description**       Field validation
  -------------------- ------------------ --------------------- --------------------
  audit_session_id     uniqueidentifier   Unique session ID     Not Null
  (PK)                                                          

  entra_email_id (FK)  uniqueidentifier   User's Entra ID       Not Null

  user_id              varchar(255)       Email/UPN             Not Null

  session_start_time   datetime2          When session began    Not Null

  session_end_time     datetime2          When session ended    Null

  ip_address           varchar(50)        Client IP             Null

  device_info          varchar(500)       Browser / OS /        Not null
                                          application           

  location             varchar(50)        Optional              Null

  solution_module_id   uniqueidentifier   Which app/module was  Null
  (FK)                                    accessed              

  session_token_id     varchar(255)       Token/trace ID for    Not null
                                          correlation           

  is_success           bit                Indicates successful  Not null
                                          login                 

  reason               varchar(255)       Failed/terminated     Null
                                          reason (if any)       
  ----------------------------------------------------------------------------------

## 4.5.2 Table: SecurityDB_Audit_Action_Log {#table-securitydb_audit_action_log .unnumbered}

Logs **every major action** performed by users during their session to
track the functions usage (e.g., \"Open Course\", \"Assign Role\",
\"View Dashboard\").

  -----------------------------------------------------------------------------
  Column             Type               Description           Field Validation
  ------------------ ------------------ --------------------- -----------------
  audit_action_id    uniqueidentifier   Unique action ID      Not null
  (PK)                                                        

  audit_session_id   uniqueidentifier   Session reference     Not null
  (FK)                                                        

  entra_email_id     uniqueidentifier   User performing the   Not null
  (FK)                                  action                

  action_timestamp   datetime2          When action occurred  Null

  solution_id (FK)   uniqueidentifier   Parent solution       Null

  module_id (FK)     uniqueidentifier   Parent module         Null

  action_name        varchar(100)       E.g.,                 Null
                                        \"RoleAssignment\",   
                                        \"CourseView\"        

  permission_code    varchar(100)       Permission evaluated  Null
                                        (e.g., COURSE_CREATE) 

  action_status      varchar(20)        Success, Denied,      Null
                                        Failed                

  additional_info    varchar(max)       API call details,     Null
                                        errors, logs          
  -----------------------------------------------------------------------------

## 4.6 Entity Relationship Diagram (including audit log tables)  {#entity-relationship-diagram-including-audit-log-tables .unnumbered}

![](media/image4.png){width="6.332450787401575in"
height="4.034739720034995in"}

#  {#section-2 .unnumbered}

# 5.0 UI/UX and Accessibility {#uiux-and-accessibility .unnumbered}

The apps, flows, and other objects that will be used to implement the
business requirements.

# 5.1 Design Consideration -- Kernel Apps (Security Control Center) {#design-consideration-kernel-apps-security-control-center .unnumbered}

# 5.1.1 UI/UX & Design Standardization {#uiux-design-standardization .unnumbered}

-   **All CLaaS2SaaS applications** must follow a **single unified
    screen layout**.

-   **Left panel** = main functionalities (static, never refreshes).

-   **Top bar** = fixed menus (static).

-   **Right panel** = Copilot bot (always visible, static).

-   **Center stage** = all transactional screens (the only part that
    refreshes).

-   Color codes, fonts, logos must follow **branding standards**.

-   Tushar must **prepare & share CSS templates and updated UI layouts**
    with all developers.

-   All applications (Developer, Manager, Mentor, CRM, etc.) must adopt
    the new standard layout.

# 5.1.2 Information Architecture / Navigation {#information-architecture-navigation .unnumbered}

-   ECC is the **primary front-end landing page for all users**; SCC is
    a module **~~under it~~**.

-   Users will see only see cards **~~representing only the solutions~~
    of the modules they are authorized to access, or that the enterprise
    has purchased/licensed from us**.

-   SCC must display menus:

    -   Security **(eg RBAC)**

    -   Admin **Config**

    -   **~~Configuration~~**

    -   Support\
        (currently 3 defined, expandable)

-   Submenu structure must allow users to **easily & seamlessly navigate
    between screens (whole page should not be reloading with each click,
    implement containers & tree structure sitemap & design).**

# 5.1.3 **Authentication & Authorization Model** {#authentication-authorization-model .unnumbered}

-   **SSO is mandatory** for all applications (no custom authentication
    tokens **at EntraID SSO level**).

-   SCC is the **single source of truth** for:

    -   User

    -   Role

    -   Solution

    -   Module

    -   Permission set

-   All applications must validate:

    -   Solution ID

    -   Module ID

    -   User ID

-   API calls must send these identifiers as the application's
    **signature**.

### **5.1.4 Role & Permission Structure** {#role-permission-structure .unnumbered}

Defined permission types:

-   **Global Admin**

-   **Admin**

-   **Collaborator**

-   **Contributor**

-   **Viewer**

Rules:

-   Only **global admin** can assign admin-level rights.

-   Application-specific admins manage only their solution/module.

-   Contributors can only edit their own records; other records are
    view-only.

-   All role and permission assignments must generate **log entries**
    (audit trail).

### **5.1.5 First‑Time User Flow** {#firsttime-user-flow .unnumbered}

-   First-time user sees:

    -   Only the **Enterprise Control Center(ECC) landing page**

    -   A **clickable button that hyperlinks to a form**: *"Request
        access from your team leader or administrator"*

-   User can request access to one or multiple solutions (dropdown
    **with checkboxes, for eg**).

-   Request notifications go **only** to the admin of that specific
    module, *not* to the global admin.

### **5.1.6 Database Structure & Technical Guidelines** {#database-structure-technical-guidelines .unnumbered}

-   **Two main areas:**

    -   **Master tables -- Solution, Module, Role, Permission.**

    -   **Transactional tables -- Assigned permissions per user.**

-   **Perform** **normalization** and maintain foreign keys between
    organization DB and security DB.

-   No hardcoded email addresses or fixed values in any coded logic.

-   **Incorporate Coding Best Practices in our code, with proper notes,
    indentation, and structure, to facilitate debugging & code reviews.
    For eg, every function must include comments indicating:**

    -   Header

    -   Purpose

    -   Dependencies

    -   Library references

### **5.1.7 Architecture & Platform** {#architecture-platform .unnumbered}

1.  **EntraID SSO is the ~~only~~ main top-level authentication
    mechanism.**

2.  **SCC becomes the central authorization engine** for all company
    applications.

3.  **Unified screen layout** across all applications **will facilitate
    low/zero level user experience fatigue & navigation familiarity.**

### **5.1.8 Authorization Model** {#authorization-model .unnumbered}

4.  Permission enforcement and token generation must be done **only
    through SCC**.

5.  Each application must provide **solution + module + user ID** as its
    identity in API requests.

6.  **Global admin** exclusively manages admin assignment; no one else
    can create admins.

### **5.1.9 User Access Workflow** {#user-access-workflow .unnumbered}

7.  First-time users see only ECC and must **request access** through
    SCC.

8.  Access requests are routed **only to the module-specific admin**,
    not global admin.

### **5.1.10 Design & Implementation** {#design-implementation .unnumbered}

9.  No hardcoded emails or values in code---everything must ~~come~~
    **be coded to be dynamically fetched from configuration tables.**

10. All applications must implement **logging of critical
    transactions**.

11. All TDs must follow the standardized **UI, CSS, logos, color codes,
    and layout**.

12. All screens will be built only **after mockups are approved by
    Product Owner**.

## 5.2 Security Control Centre Hub {#security-control-centre-hub .unnumbered}

A centralized Model-driven app app for all roles to manage modules,
roles, assignments, master data, and review audit logs with role-based
access enforced from Entra ID.

Login screen:

![](media/image5.png){width="4.783055555555555in"
height="3.4046052055993in"}

When No Role is assigned to user, below screen is displayed

![A screenshot of a computer Description automatically
generated](media/image6.png){width="4.7245286526684165in"
height="3.477777777777778in"}

Landing page when user does not have any role assigned:

![](media/image7.png){width="4.7411340769903765in"
height="3.4817705599300086in"}

![](media/image8.png){width="4.74340113735783in"
height="3.483435039370079in"}

![](media/image9.png){width="4.990885826771653in"
height="3.639187445319335in"}

## 5.3 Module Management screen {#module-management-screen .unnumbered}

![](media/image10.png){width="6.0in" height="3.6979166666666665in"}

![](media/image11.png){width="6.0in" height="4.958333333333333in"}

## 5.3 User Management screen for profile enrichment  {#user-management-screen-for-profile-enrichment .unnumbered}

![](media/image12.png){width="6.0in" height="3.71875in"}

![](media/image13.png){width="6.0in" height="3.6770833333333335in"}

## 5.4 Security Role Management  {#security-role-management .unnumbered}

![](media/image14.png){width="6.0in" height="3.78125in"}

![](media/image15.png){width="6.0in" height="3.6875in"}

![](media/image16.png){width="6.0in" height="3.7708333333333335in"}

## 5.5 Security User Role Assignment  {#security-user-role-assignment .unnumbered}

![](media/image17.png){width="5.609375546806649in"
height="4.577094269466317in"}

![](media/image18.png){width="5.770833333333333in" height="6.0in"}

##  {#section-3 .unnumbered}

## 5.6 Audit Log viewing UI {#audit-log-viewing-ui .unnumbered}

![](media/image19.png){width="6.0in" height="4.885416666666667in"}

![](media/image20.png){width="6.0in" height="5.5625in"}

![A screenshot of a computer Description automatically
generated](media/image21.png){width="6.0in"
height="5.221527777777778in"}

![A screenshot of a computer Description automatically
generated](media/image22.png){width="6.0in"
height="5.624305555555556in"}

# 6.0 Security Role & Permission Model {#security-role-permission-model .unnumbered}

## 6.1 Defining Permission {#defining-permission .unnumbered}

## Permission will be managed under role  {#permission-will-be-managed-under-role .unnumbered}

## 6.2 Defining Role (Admin, Collaborator, Contributor, Viewer, Global Admin) and Permission mapping  {#defining-role-admin-collaborator-contributor-viewer-global-admin-and-permission-mapping .unnumbered}

The generic RBAC model uses six primary roles that map to CRUD-style
operations. All roles inherit from a base \'User\' concept
(authenticated Entra user).

+---------+---------+------+------+------+------+------+------+------+
| S       | Per     | Cr   | Read | Up   | De   | Read | Full | Full |
| ecurity | mission | eate |      | date | lete | all  | acc  | ac   |
| Role    |         |      |      |      |      | user | ess( | cess |
|         |         |      |      |      |      | data | da   | (All |
|         |         |      |      |      |      |      | ta + | da   |
|         |         |      |      |      |      |      | a    | ta + |
|         |         |      |      |      |      |      | dmin | a    |
|         |         |      |      |      |      |      | wi   | dmin |
|         |         |      |      |      |      |      | thin | in   |
|         |         |      |      |      |      |      | mod  | all  |
|         |         |      |      |      |      |      | ule) | the  |
|         |         |      |      |      |      |      |      | mo   |
|         |         |      |      |      |      |      |      | dule |
|         |         |      |      |      |      |      |      | )    |
+=========+=========+======+======+======+======+======+======+======+
| Viewer  | View    | No   | Yes  | No   | No   | Yes  | No   | No   |
|         | appl    |      |      |      |      |      |      |      |
|         | ication |      |      |      |      |      |      |      |
|         | data    |      |      |      |      |      |      |      |
+---------+---------+------+------+------+------+------+------+------+
| Cont    | CRUD to | Yes  | Yes  | Yes  | Yes  | No   | No   | No   |
| ributor | own     |      | to   | (own | (own |      |      |      |
|         | Data +  |      | all  | cont | cont |      |      |      |
|         | Read    |      |      | ent) | ent) |      |      |      |
|         | for all |      |      |      |      |      |      |      |
|         | except  |      |      |      |      |      |      |      |
|         | Admin   |      |      |      |      |      |      |      |
|         | MDM     |      |      |      |      |      |      |      |
+---------+---------+------+------+------+------+------+------+------+
| Colla   | CRUD to | Yes( | Yes( | Yes  | Yes  | Yes( | No   | No   |
| borator | All     | All) | All) | (    | (    | All) |      |      |
|         | Data    |      |      | all) | all) |      |      |      |
| (M      |         |      |      |      |      |      |      |      |
| anager) |         |      |      |      |      |      |      |      |
+---------+---------+------+------+------+------+------+------+------+
| Admin   | CRUD to | Yes( | Yes( | Yes  | Yes  | Yes( | Yes  | No   |
|         | All     | All) | All) | (a   | (a   | All) |      |      |
|         | Data    |      |      | ll + | ll + |      |      |      |
|         | for     |      |      | s    | us   |      |      |      |
|         | ind     |      |      | etti | ers) |      |      |      |
|         | ividual |      |      | ngs) |      |      |      |      |
|         | m       |      |      |      |      |      |      |      |
|         | odule + |      |      |      |      |      |      |      |
|         | Admin   |      |      |      |      |      |      |      |
|         | MDM     |      |      |      |      |      |      |      |
+---------+---------+------+------+------+------+------+------+------+
| Global  | View    | Yes  | Yes  | Yes  | Yes  | Yes  | Yes  | Yes  |
| Admin   | all     |      |      |      |      |      |      |      |
|         | data +  |      |      |      |      |      |      |      |
|         | Admin   |      |      |      |      |      |      |      |
|         | pr      |      |      |      |      |      |      |      |
|         | ivilege |      |      |      |      |      |      |      |
+---------+---------+------+------+------+------+------+------+------+

These generic roles can be reused across modules. If a module requires
more granular roles, they can be added as additional rows in
SecurityDB_SECURITY_ROLE without changing the core model.

## 6.3 User Security Role Assignment Process {#user-security-role-assignment-process .unnumbered}

-   User security role assignments are stored in security_user_role.
    Security roles can be assigned in several ways:

    -   Manual assignment by a SCC Admin using a Security Control Centre
        Module. This is included in current scope.

    -   Rule-based auto-assignment based on user attributes (e.g.,
        department, program, or external system data) -- will be
        addressed in future enhancement

-   Assignments capture who assigned the role, when, and why, enabling
    audit trails and governance. When a user should no longer have a
    role, the IsActive flag is set to 0 rather than deleting the record.
    This will be addressed in future enhancement.

## 6.4 Workflow Automation {#workflow-automation .unnumbered}

## 6.4.1 User Provisioning Automator {#user-provisioning-automator .unnumbered}

A Power Automate flow Automatically provisions users in Security Control
Center upon role assignment, enriching their profiles as needed,
ensuring seamless onboarding.

## 6.4.2 Audit Action Analytics {#audit-action-analytics .unnumbered}

A BI Report for Interactive dashboards to visualize security audit logs,
user actions, and module activity, supporting admins, verifiers, and
global admins with oversight tools.

## 6.4.3 RBAC Interactive Analyst {#rbac-interactive-analyst .unnumbered}

A Copilot Agent providing interactive analytics, audit log queries, and
insights, answering ad-hoc questions for all users and assisting admins
in real-time, decision-making.

# 7. Security, Governance & Operations {#security-governance-operations .unnumbered}

Security and governance are critical for the RBAC solution. The
following operational considerations apply:

-   Only Security Admins should have Dataverse security roles that allow
    changes to AIW_SECURITY_ROLE, AIW_SECURITY_PERMISSION,
    AIW_SECURITY_ROLE_PERMISSION, and AIW_SECURITY_USER_ROLE.

-   Standard operational procedures should define how new roles and
    permissions are requested, reviewed, and approved.

-   Backups and ALM processes should ensure that Security Kernel changes
    can be promoted safely across environments (Dev, Test, Prod).

# 8. Testing and Quality Assurance {#testing-and-quality-assurance .unnumbered}

A comprehensive testing approach will be applied, including unit testing
to validate individual components, integration testing to ensure
seamless interaction between the RBAC engine, provisioning flows, and
various solution modules, and user acceptance testing (UAT) to confirm
end-to-end functionality meets business and security requirements. All
defects identified during testing will be documented, resolved, and
retested to ensure system reliability and compliance.

# 9. Application Deployment & Release Management {#application-deployment-release-management .unnumbered}

Deployment will follow a controlled release process across Development,
Test, and Production environments, ensuring that all RBAC
configurations, data schema updates, and module components are migrated
consistently and securely. Each release will undergo pre-deployment
validation, and post-deployment verification to ensure system stability.
All changes will be tracked through formal change management procedures
to maintain compliance and auditability.

Deployment follows ALM with Dev → Test → Prod environments.

# 10. Application Management & Support {#application-management-support .unnumbered}

Operations and support activities include continuous monitoring of audit
logs to detect anomalies, regular review of user-role assignments to
ensure ongoing compliance with least-privilege principles, and timely
handling of access requests in accordance with defined approval
workflows. The support team will also address incidents, provision
updates, and maintain system health to ensure secure and uninterrupted
operation of the RBAC environment.

# 11. KPIs & Risk Management {#kpis-risk-management .unnumbered}

Key performance indicators such as access provisioning accuracy, login
success rate will be monitored to measure the effectiveness and
reliability of the RBAC solution. Regular reviews and corrective actions
will be implemented to maintain compliance and reduce exposure to
security vulnerabilities.

# 12. Future Enhancements {#future-enhancements .unnumbered}

-   Row-level security integration for highly sensitive data scenarios.

-   Self-service access requests with approval workflows.

-   Fine-grained time-based access (temporary roles for specific
    events).

-   Integration with monitoring tools and dashboards for security
    analytics.

-   Periodic recertification of user roles should be performed to ensure
    least-privilege access.

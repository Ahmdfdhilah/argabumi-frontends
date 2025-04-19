// utils/enums.ts

export enum PeriodStatus {
    DRAFT = "Draft",
    ACTIVE = "Active",
    CLOSED = "Closed",
  }
  
  export enum Perspective {
    FINANCIAL = "Financial",
    CUSTOMER = "Customer",
    INTERNAL_BUSINESS_PROCESS = "Internal Business Process",
    LEARNING_GROWTH = "Learning & Growth",
  }
  
  export enum UOMType {
    CURRENCY = "Currency",
    NUMBER = "Number",
    DAYS = "Days",
    PERCENTAGE = "%",
    KRITERIA = "Kriteria",
  }
  
  export enum CategoryType {
    MAX = "Max",
    MIN = "Min",
    ON_TARGET = "On Target",
    MAX_IS_100 = "Max is 100",
    MIN_IS_0 = "Min is 0",
  }
  
  export enum CalculationType {
    AVERAGE = "Average",
    ACCUMULATIVE = "Accumulative",
    LAST_VALUE = "Last Value",
  }
  
  export enum ApprovalStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
  }
  
  export enum ActionPlanStatus {
    PENDING = "Pending",
    EVIDENCE_SUBMITTED = "Evidence Submitted",
    APPROVED_BY_MANAGER = "Approved by Manager",
    VALIDATED_BY_SM = "Validated by SM",
  }
  
  export enum EvidenceStatus {
    NOT_SUBMITTED = "Not Submitted",
    SUBMITTED = "Submitted",
    APPROVED = "Approved",
    REJECTED = "Rejected",
  }
  
  export enum ActionPlanProgressStatus {
    ON_TRACK = "On Track",
    AT_RISK = "At Risk",
    OFF_TRACK = "Off Track",
  }
  
  export enum RoleType {
    ADMIN = "admin",
    EMPLOYEE = "employee",
    MANAGER_DEPT = "manager_dept",
    SM_DEPT = "sm_dept",
  }
  
  export enum UnitType {
    IT = "IT",
    MARKETING = "Marketing",
    SALES = "Sales",
    OPERATIONS = "Operations",
    CUSTOMER_SERVICE = "Customer Service",
    FINANCE = "Finance",
    HUMAN_RESOURCES = "Human Resources",
    RESEARCH_AND_DEVELOPMENT = "Research and Development",
    PRODUCTION = "Production",
    LEADERSHIP = "Leadership",
  }
  
  export enum ActivityType {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
  }
  
  export enum ChangeRequestStatus {
    DRAFT = "DRAFT",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED",
  }
  
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "admin" | "approver" | "treasurer" | "viewer";
export type BankAccountType =
  | "current"
  | "investment"
  | "loan"
  | "money_market"
  | "savings";
export type BankAccountStatus = "active" | "frozen" | "inactive";
export type TransactionType =
  | "credit"
  | "debit"
  | "fee"
  | "fx"
  | "interest"
  | "transfer";
export type TransactionCategory =
  | "debt_service"
  | "fx"
  | "intercompany"
  | "investment"
  | "other"
  | "payroll"
  | "tax"
  | "vendor";
export type TransactionStatus =
  | "cancelled"
  | "completed"
  | "failed"
  | "pending"
  | "reconciled";
export type ForecastCategory =
  | "financing"
  | "fx"
  | "investing"
  | "operating"
  | "other";
export type ForecastConfidence = "high" | "low" | "medium";
export type PaymentType =
  | "ach"
  | "check"
  | "internal"
  | "sepa"
  | "swift"
  | "wire";
export type PaymentStatus =
  | "approved"
  | "cancelled"
  | "completed"
  | "draft"
  | "failed"
  | "pending_approval"
  | "processing"
  | "rejected";
export type PaymentPriority = "high" | "low" | "normal" | "urgent";
export type ApprovalAction = "approved" | "recalled" | "rejected";
export type RiskType =
  | "counterparty"
  | "credit"
  | "fx"
  | "interest_rate"
  | "liquidity";
export type RiskSeverity = "critical" | "high" | "low" | "medium";

export interface Database {
  public: {
    Tables: {
      approval_workflows: {
        Row: {
          action: ApprovalAction;
          actioned_at: string;
          approver_id: string;
          comments: string | null;
          created_at: string;
          id: string;
          payment_id: string;
        };
        Insert: {
          action: ApprovalAction;
          actioned_at?: string;
          approver_id: string;
          comments?: string | null;
          created_at?: string;
          id?: string;
          payment_id: string;
        };
        Update: {
          action?: ApprovalAction;
          actioned_at?: string;
          approver_id?: string;
          comments?: string | null;
          created_at?: string;
          id?: string;
          payment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approval_workflows_approver_id_fkey";
            columns: ["approver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "approval_workflows_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
          new_data: Json | null;
          old_data: Json | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bank_accounts: {
        Row: {
          account_name: string;
          account_number: string;
          account_type: BankAccountType;
          available_balance: number;
          bank_code: string | null;
          bank_name: string;
          country: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          current_balance: number;
          entity_name: string | null;
          iban: string | null;
          id: string;
          last_synced_at: string | null;
          notes: string | null;
          status: BankAccountStatus;
          swift_bic: string | null;
          updated_at: string;
        };
        Insert: {
          account_name: string;
          account_number: string;
          account_type?: BankAccountType;
          available_balance?: number;
          bank_code?: string | null;
          bank_name: string;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          current_balance?: number;
          entity_name?: string | null;
          iban?: string | null;
          id?: string;
          last_synced_at?: string | null;
          notes?: string | null;
          status?: BankAccountStatus;
          swift_bic?: string | null;
          updated_at?: string;
        };
        Update: {
          account_name?: string;
          account_number?: string;
          account_type?: BankAccountType;
          available_balance?: number;
          bank_code?: string | null;
          bank_name?: string;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          current_balance?: number;
          entity_name?: string | null;
          iban?: string | null;
          id?: string;
          last_synced_at?: string | null;
          notes?: string | null;
          status?: BankAccountStatus;
          swift_bic?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_accounts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cash_flow_forecasts: {
        Row: {
          category: ForecastCategory | null;
          confidence: ForecastConfidence;
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string | null;
          entity_name: string | null;
          forecast_date: string;
          id: string;
          inflow_amount: number;
          is_actual: boolean;
          net_position: number;
          outflow_amount: number;
          updated_at: string;
        };
        Insert: {
          category?: ForecastCategory | null;
          confidence?: ForecastConfidence;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          entity_name?: string | null;
          forecast_date: string;
          id?: string;
          inflow_amount?: number;
          is_actual?: boolean;
          outflow_amount?: number;
          updated_at?: string;
        };
        Update: {
          category?: ForecastCategory | null;
          confidence?: ForecastConfidence;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          entity_name?: string | null;
          forecast_date?: string;
          id?: string;
          inflow_amount?: number;
          is_actual?: boolean;
          outflow_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cash_flow_forecasts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      currency_rates: {
        Row: {
          base: string;
          created_at: string;
          id: string;
          rate: number;
          rate_date: string;
          source: string;
          target: string;
        };
        Insert: {
          base: string;
          created_at?: string;
          id?: string;
          rate: number;
          rate_date: string;
          source?: string;
          target: string;
        };
        Update: {
          base?: string;
          created_at?: string;
          id?: string;
          rate?: number;
          rate_date?: string;
          source?: string;
          target?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          approval_level: number;
          approved_at: string | null;
          approved_by: string | null;
          beneficiary_bank: string | null;
          beneficiary_iban: string | null;
          beneficiary_name: string;
          created_at: string;
          created_by: string | null;
          currency: string;
          from_account_id: string | null;
          id: string;
          notes: string | null;
          payment_ref: string;
          payment_type: PaymentType;
          priority: PaymentPriority;
          purpose: string | null;
          required_approvals: number;
          status: PaymentStatus;
          to_account_id: string | null;
          updated_at: string;
          value_date: string | null;
        };
        Insert: {
          amount: number;
          approval_level?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          beneficiary_bank?: string | null;
          beneficiary_iban?: string | null;
          beneficiary_name: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          from_account_id?: string | null;
          id?: string;
          notes?: string | null;
          payment_ref: string;
          payment_type?: PaymentType;
          priority?: PaymentPriority;
          purpose?: string | null;
          required_approvals?: number;
          status?: PaymentStatus;
          to_account_id?: string | null;
          updated_at?: string;
          value_date?: string | null;
        };
        Update: {
          amount?: number;
          approval_level?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          beneficiary_bank?: string | null;
          beneficiary_iban?: string | null;
          beneficiary_name?: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          from_account_id?: string | null;
          id?: string;
          notes?: string | null;
          payment_ref?: string;
          payment_type?: PaymentType;
          priority?: PaymentPriority;
          purpose?: string | null;
          required_approvals?: number;
          status?: PaymentStatus;
          to_account_id?: string | null;
          updated_at?: string;
          value_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_from_account_id_fkey";
            columns: ["from_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_to_account_id_fkey";
            columns: ["to_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          role: ProfileRole;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          role?: ProfileRole;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          role?: ProfileRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      risk_exposures: {
        Row: {
          base_currency: string;
          counterparty: string | null;
          created_at: string;
          created_by: string | null;
          currency_pair: string | null;
          entity_name: string | null;
          exposure_amount: number;
          exposure_date: string;
          hedge_ratio: number;
          id: string;
          mark_to_market: number | null;
          maturity_date: string | null;
          notes: string | null;
          notional_amount: number | null;
          risk_type: RiskType;
          severity: RiskSeverity;
          updated_at: string;
        };
        Insert: {
          base_currency?: string;
          counterparty?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency_pair?: string | null;
          entity_name?: string | null;
          exposure_amount: number;
          exposure_date: string;
          hedge_ratio?: number;
          id?: string;
          mark_to_market?: number | null;
          maturity_date?: string | null;
          notes?: string | null;
          notional_amount?: number | null;
          risk_type: RiskType;
          severity?: RiskSeverity;
          updated_at?: string;
        };
        Update: {
          base_currency?: string;
          counterparty?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency_pair?: string | null;
          entity_name?: string | null;
          exposure_amount?: number;
          exposure_date?: string;
          hedge_ratio?: number;
          id?: string;
          mark_to_market?: number | null;
          maturity_date?: string | null;
          notes?: string | null;
          notional_amount?: number | null;
          risk_type?: RiskType;
          severity?: RiskSeverity;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "risk_exposures_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          bank_account_id: string;
          base_amount: number | null;
          booking_date: string | null;
          category: TransactionCategory | null;
          counterparty: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string | null;
          exchange_rate: number | null;
          id: string;
          reconciled: boolean;
          reference: string | null;
          status: TransactionStatus;
          transaction_ref: string;
          transaction_type: TransactionType;
          updated_at: string;
          value_date: string;
        };
        Insert: {
          amount: number;
          bank_account_id: string;
          base_amount?: number | null;
          booking_date?: string | null;
          category?: TransactionCategory | null;
          counterparty?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          exchange_rate?: number | null;
          id?: string;
          reconciled?: boolean;
          reference?: string | null;
          status?: TransactionStatus;
          transaction_ref: string;
          transaction_type: TransactionType;
          updated_at?: string;
          value_date: string;
        };
        Update: {
          amount?: number;
          bank_account_id?: string;
          base_amount?: number | null;
          booking_date?: string | null;
          category?: TransactionCategory | null;
          counterparty?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          exchange_rate?: number | null;
          id?: string;
          reconciled?: boolean;
          reference?: string | null;
          status?: TransactionStatus;
          transaction_ref?: string;
          transaction_type?: TransactionType;
          updated_at?: string;
          value_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey";
            columns: ["bank_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

export type TableName = keyof PublicTables;

export type TableRow<TTableName extends TableName> =
  PublicTables[TTableName]["Row"];
export type TableInsert<TTableName extends TableName> =
  PublicTables[TTableName]["Insert"];
export type TableUpdate<TTableName extends TableName> =
  PublicTables[TTableName]["Update"];

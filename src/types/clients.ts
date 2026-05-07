/** Selected `public.clients` columns used by the client dashboard and portal. */
export type ClientDashboardRow = {
  credits: number | null
  has_active_subscription: boolean | null
  google_drive_folder_id: string | null
  is_custom_build?: boolean | null
  next_strategy_call?: string | null
  intake_call_date?: string | null
  current_project?: string | null
}

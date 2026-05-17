// Tipos de domínio do Clube Fidelidade.
// Estes tipos espelham o schema Prisma mas são independentes dele —
// usados nas camadas de API, componentes e hooks.

// ─────────────────────────────────────────
// Enums
// ─────────────────────────────────────────

export type UserRole = "PROFESSIONAL" | "CLIENT"

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "EXPIRED"

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

// ─────────────────────────────────────────
// Modelos de domínio
// ─────────────────────────────────────────

export interface User {
  id:            string
  name:          string | null
  email:         string
  image:         string | null
  role:          UserRole
  phone:         string | null
  createdAt:     string // ISO 8601
  updatedAt:     string
}

export interface Plan {
  id:                   string
  professionalId:       string
  name:                 string
  description:          string | null
  priceInCents:         number
  appointmentsPerMonth: number
  durationDays:         number
  isActive:             boolean
  mpPreapprovalPlanId:  string | null
  createdAt:            string
  updatedAt:            string
}

export interface Subscription {
  id:               string
  clientId:         string
  planId:           string
  status:           SubscriptionStatus
  startDate:        string | null
  endDate:          string | null
  nextBillingDate:  string | null
  mpSubscriptionId: string | null
  appointmentsUsed: number
  createdAt:        string
  updatedAt:        string
  // relações opcionais (quando incluídas na query)
  plan?:            Plan
  client?:          Pick<User, "id" | "name" | "email" | "image" | "phone">
}

export interface Appointment {
  id:               string
  clientId:         string
  professionalId:   string
  subscriptionId:   string | null
  scheduledAt:      string
  durationMinutes:  number
  status:           AppointmentStatus
  serviceType:      string | null
  notes:            string | null
  cancelledAt:      string | null
  cancelReason:     string | null
  createdAt:        string
  updatedAt:        string
  // relações opcionais
  client?:          Pick<User, "id" | "name" | "email" | "image" | "phone">
  subscription?:    Pick<Subscription, "id" | "plan">
}

export interface Post {
  id:             string
  professionalId: string
  title:          string
  content:        string
  imageUrl:       string | null
  publishedAt:    string | null
  isPublished:    boolean
  createdAt:      string
  updatedAt:      string
}

// ─────────────────────────────────────────
// Respostas de API
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data:       T[]
  pagination: Pagination
}

export interface Pagination {
  page:       number
  pageSize:   number
  total:      number
  totalPages: number
}

export interface ApiError {
  error:   string
  message: string
  details?: Record<string, string[]>
}

// ─────────────────────────────────────────
// Dashboard (agregados para o painel prof.)
// ─────────────────────────────────────────

export interface DashboardMetrics {
  appointmentsToday:  number
  activeClients:      number
  monthlyRevenue:     number // em centavos
  pendingAppointments: number
}

// ─────────────────────────────────────────
// Área do cliente (estado consolidado)
// ─────────────────────────────────────────

export interface ClientOverview {
  subscription:          Subscription | null
  appointmentsRemaining: number
  nextAppointment:       Appointment | null
  recentPosts:           Post[]
}

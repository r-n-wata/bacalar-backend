import type {
  AppLanguage,
  EventCategory,
  RestaurantMoment,
  TourCategory,
} from './content'
import type {
  EventSubmissionStatus,
  SubmissionImageRecord,
} from './eventSubmissions'
import type { RestaurantSubmissionStatus } from './restaurantSubmissions'
import type { TourSubmissionStatus } from './tourSubmissions'

export type AdminSubmissionListType = 'all' | 'events' | 'restaurants' | 'tours'
export type AdminSubmissionEntityType = Exclude<AdminSubmissionListType, 'all'>
export type ReviewableSubmissionStatus =
  | EventSubmissionStatus
  | RestaurantSubmissionStatus
  | TourSubmissionStatus

export type AdminSession = {
  email: string
  userId: string
}

type AdminSubmissionBase = {
  id: string
  type: AdminSubmissionEntityType
  status: ReviewableSubmissionStatus
  submittedLocale: AppLanguage
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  createdAt: string
  updatedAt: string
  images: SubmissionImageRecord[]
}

export type AdminEventSubmission = AdminSubmissionBase & {
  type: 'events'
  title: string
  startsAt: string
  location: string
  category: EventCategory
  description: string
}

export type AdminRestaurantSubmission = AdminSubmissionBase & {
  type: 'restaurants'
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
  description: string
}

export type AdminTourSubmission = AdminSubmissionBase & {
  type: 'tours'
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
}

export type AdminSubmissionListItem =
  | AdminEventSubmission
  | AdminRestaurantSubmission
  | AdminTourSubmission

export type AdminSubmissionListResponse = {
  items: AdminSubmissionListItem[]
}

export type SubmissionModerationResult = {
  id: string
  type: AdminSubmissionEntityType
  status: 'APPROVED' | 'REJECTED'
  reviewedAt: string
  reviewedBy: string
  publishedRecordId?: string
}

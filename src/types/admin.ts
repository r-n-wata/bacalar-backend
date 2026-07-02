import type {
  AppLanguage,
  EventCategory,
  HomeImage,
  RestaurantMoment,
  TourCategory,
} from './content'
import type { SubmissionImageRecord } from './eventSubmissions'

export type AdminSubmissionListType = 'all' | 'events' | 'restaurants' | 'tours'
export type AdminSubmissionEntityType = Exclude<AdminSubmissionListType, 'all'>
export type AdminSubmissionStatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
export type ReviewableSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AdminSession = {
  email: string
  userId: string
}

export type AdminSubmissionThumbnail = SubmissionImageRecord

type AdminSubmissionListBase = {
  id: string
  type: AdminSubmissionEntityType
  status: ReviewableSubmissionStatus
  submittedLocale: AppLanguage
  createdAt: string
  updatedAt: string
  thumbnail?: AdminSubmissionThumbnail
}

type AdminSubmissionDetailBase = AdminSubmissionListBase & {
  contactName: string
  contactMethod: string
  instagram?: string
  whatsapp?: string
  images: SubmissionImageRecord[]
}

export type AdminEventSubmissionListItem = AdminSubmissionListBase & {
  type: 'events'
  title: string
  startsAt: string
  location: string
  category: EventCategory
}

export type AdminRestaurantSubmissionListItem = AdminSubmissionListBase & {
  type: 'restaurants'
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
}

export type AdminTourSubmissionListItem = AdminSubmissionListBase & {
  type: 'tours'
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
}

export type AdminSubmissionListItem =
  | AdminEventSubmissionListItem
  | AdminRestaurantSubmissionListItem
  | AdminTourSubmissionListItem

export type AdminEventSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'events'
  title: string
  startsAt: string
  location: string
  category: EventCategory
  description: string
}

export type AdminRestaurantSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'restaurants'
  name: string
  cuisine: string
  moment: RestaurantMoment
  priceBand: '$' | '$$' | '$$$'
  description: string
}

export type AdminTourSubmissionDetail = AdminSubmissionDetailBase & {
  type: 'tours'
  name: string
  category: TourCategory
  durationHours: number
  priceFrom: number
  description: string
}

export type AdminSubmissionDetail =
  | AdminEventSubmissionDetail
  | AdminRestaurantSubmissionDetail
  | AdminTourSubmissionDetail

export type AdminSubmissionListResponse = {
  items: AdminSubmissionListItem[]
}

export type AdminSubmissionDetailResponse = {
  item: AdminSubmissionDetail
}

export type SubmissionModerationResult = {
  id: string
  type: AdminSubmissionEntityType
  status: 'APPROVED' | 'REJECTED'
  reviewedAt: string
  reviewedBy: string
  publishedRecordId?: string
}

export type AdminPublishedContentType = 'events' | 'restaurants' | 'tours'

type AdminPublishedContentBase = {
  id: string
  type: AdminPublishedContentType
  title: string
  route: string
  isFeatured: boolean
  featuredOrder?: number
  image?: HomeImage
}

export type AdminPublishedEventItem = AdminPublishedContentBase & {
  type: 'events'
  category: EventCategory
  subtitle: string
}

export type AdminPublishedRestaurantItem = AdminPublishedContentBase & {
  type: 'restaurants'
  moments: RestaurantMoment[]
  subtitle: string
}

export type AdminPublishedTourItem = AdminPublishedContentBase & {
  type: 'tours'
  category: TourCategory
  subtitle: string
}

export type AdminPublishedContentItem =
  | AdminPublishedEventItem
  | AdminPublishedRestaurantItem
  | AdminPublishedTourItem

export type AdminPublishedContentListResponse = {
  items: AdminPublishedContentItem[]
  featuredCount: number
  featuredCap: number
}

export type UpdateAdminPublishedContentFeaturedInput = {
  type: AdminPublishedContentType
  id: string
  isFeatured: boolean
  language: AppLanguage
}

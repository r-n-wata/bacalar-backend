import type { PrismaClient } from '@prisma/client'

export type AdminAccountRecord = {
  id: string
  email: string
  supabaseUserId?: string
  isActive: boolean
}

export type AdminAccountRepository = {
  findActiveByEmail(email: string): Promise<AdminAccountRecord | null>
}

export function createPrismaAdminAccountRepository(
  prisma: PrismaClient,
): AdminAccountRepository {
  return {
    async findActiveByEmail(email) {
      const account = await prisma.adminAccount.findUnique({
        where: {
          email,
        },
      })

      if (!account || !account.isActive) {
        return null
      }

      return {
        id: account.id,
        email: account.email,
        supabaseUserId: account.supabaseUserId ?? undefined,
        isActive: account.isActive,
      }
    },
  }
}

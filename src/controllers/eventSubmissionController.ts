import type { Request, Response } from 'express'
import type { EventSubmissionService } from '../services/eventSubmissionService'

export function createEventSubmissionController(service: EventSubmissionService) {
  return {
    createSubmission: async (request: Request, response: Response) => {
      const payload = await service.createSubmission(request.body)

      response.status(201).json(payload)
    },
    prepareUpload: async (request: Request, response: Response) => {
      const payload = await service.prepareUpload(request.body)

      response.status(201).json(payload)
    },
  }
}

import * as core from '@actions/core'
import { runForECR } from './ecr'
import { runForECRPublic } from './ecr_public'

interface Inputs {
  public: boolean
  deleteRepo: boolean
  repository: string
  lifecyclePolicy: string
  repoPolicy: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (inputs.public === true) {
    if (inputs.lifecyclePolicy) {
      throw new Error(`currently ECR Public does not support the lifecycle policy`)
    }
    if (inputs.repoPolicy) {
      throw new Error(`currently ECR Public does not support the repo policy`)
    }
    const outputs = await runForECRPublic(inputs)
    core.setOutput('repository-uri', outputs.repositoryUri)
    return
  }

  const outputs = await runForECR({
    repository: inputs.repository,
    deleteRepo: inputs.deleteRepo,
    lifecyclePolicy: inputs.lifecyclePolicy !== '' ? inputs.lifecyclePolicy : undefined,
    repoPolicy: inputs.repoPolicy !== '' ? inputs.repoPolicy : undefined,
  })
  core.setOutput('repository-uri', outputs.repositoryUri)
  return
}

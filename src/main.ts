import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    public: core.getBooleanInput('public', { required: true }),
    deleteRepo: core.getBooleanInput('deleteRepo', { required: true }),
    repository: core.getInput('repository', { required: true }),
    lifecyclePolicy: core.getInput('lifecycle-policy'),
    repoPolicy: core.getInput('repo-policy'),
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))

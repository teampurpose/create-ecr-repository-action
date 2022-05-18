import { mockClient } from 'aws-sdk-client-mock'
import * as ecr from '@aws-sdk/client-ecr'
import * as ecrPublic from '@aws-sdk/client-ecr-public'
import * as core from '@actions/core'
import { run } from '../src/run'

jest.mock('@actions/core', () => {
  const original: typeof core = jest.requireActual('@actions/core')
  return {
    ...original,
    setOutput: jest.fn().mockImplementation(original.setOutput),
  }
})
const setOutputMock = core.setOutput as jest.Mock

const mocks = {
  ecr: mockClient(ecr.ECRClient),
  ecrPublic: mockClient(ecrPublic.ECRPUBLICClient),
}

test('lifecycle', async () => {
  mocks.ecr.on(ecr.DescribeRepositoriesCommand).resolves({
    repositories: [
      {
        repositoryName: 'foobar',
        repositoryUri: '123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/foobar',
      },
    ],
  })
  mocks.ecr.on(ecr.PutLifecyclePolicyCommand).resolves({
    repositoryName: 'foobar',
  })
  await run({
    repository: 'foo/bar',
    lifecyclePolicy: `${__dirname}/fixtures/lifecycle-policy.json`,
    public: false,
  })
  expect(setOutputMock).toBeCalledWith('repository-uri', '123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/foobar')
})

test('repo policy', async () => {
  mocks.ecr.on(ecr.DescribeRepositoriesCommand).resolves({
    repositories: [
      {
        repositoryName: 'foobar',
        repositoryUri: '123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/foobar',
      },
    ],
  })
  mocks.ecr.on(ecr.SetRepositoryPolicyCommand).resolves({
    repositoryName: 'foobar',
  })
  await run({
    repository: 'foo/bar',
    repoPolicy: `${__dirname}/fixtures/repo-policy.json`,
    public: false,
  })
  expect(setOutputMock).toBeCalledWith('repository-uri', '123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/foobar')
})

test('ecr public', async () => {
  mocks.ecrPublic.on(ecrPublic.DescribeRepositoriesCommand).resolves({
    repositories: [
      {
        repositoryName: 'foobar',
        repositoryUri: 'public.ecr.aws/12345678/foobar',
      },
    ],
  })
  await run({
    repository: 'foo/bar',
    lifecyclePolicy: '',
    public: true,
  })
  expect(setOutputMock).toBeCalledWith('repository-uri', 'public.ecr.aws/12345678/foobar')
})


    'use client';


import { 07CreateDappCliIDL, get07CreateDappCliProgramId } from '@07-create-dapp-cli/anchor'
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function use07CreateDappCliProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(
    () => get07CreateDappCliProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(07CreateDappCliIDL, programId, provider)

  const accounts = useQuery({
    queryKey: ['07-create-dapp-cli', 'all', { cluster }],
    queryFn: () => program.account.07CreateDappCli.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['07-create-dapp-cli', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ 07CreateDappCli: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function use07CreateDappCliProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = use07CreateDappCliProgram()

  const accountQuery = useQuery({
    queryKey: ['07-create-dapp-cli', 'fetch', { cluster, account }],
    queryFn: () => program.account.07CreateDappCli.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['07-create-dapp-cli', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ 07CreateDappCli: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['07-create-dapp-cli', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ 07CreateDappCli: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['07-create-dapp-cli', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ 07CreateDappCli: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['07-create-dapp-cli', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ 07CreateDappCli: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}

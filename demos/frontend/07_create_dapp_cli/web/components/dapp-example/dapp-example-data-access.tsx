'use client';

import { DappExampleIDL, getDappExampleProgramId } from '@dapp-example/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useDappExampleProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDappExampleProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(DappExampleIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['dapp-example', 'all', { cluster }],
    queryFn: () => program.account.dappExample.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['dapp-example', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ dappExample: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useDappExampleProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useDappExampleProgram();

  const accountQuery = useQuery({
    queryKey: ['dapp-example', 'fetch', { cluster, account }],
    queryFn: () => program.account.dappExample.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['dapp-example', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ dappExample: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['dapp-example', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ dappExample: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['dapp-example', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ dappExample: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['dapp-example', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ dappExample: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}

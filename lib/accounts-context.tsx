import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MOCK_ACCOUNTS,
  type Account,
  type AccountType,
} from './mock-data';

type CreateAccountInput = {
  name: string;
  type: AccountType;
  address?: string;
  phone?: string;
  email?: string;
};

type UpdateAccountInput = Partial<CreateAccountInput>;

type AccountsContextValue = {
  accounts: Account[];
  getAccountById: (id: string) => Account | undefined;
  addAccount: (data: CreateAccountInput) => Account;
  updateAccount: (id: string, data: UpdateAccountInput) => void;
  deleteAccount: (id: string) => void;
};

const AccountsContext = createContext<AccountsContextValue | null>(null);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() =>
    MOCK_ACCOUNTS.map((a) => ({ ...a }))
  );

  const getAccountById = useCallback(
    (id: string) => {
      return accounts.find((a) => a.id === id);
    },
    [accounts]
  );

  const addAccount = useCallback((data: CreateAccountInput): Account => {
    const now = new Date();
    const newAccount: Account = {
      id: `account-${Date.now()}`,
      name: data.name,
      type: data.type,
      address: data.address,
      phone: data.phone,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };

    setAccounts((prev) => [newAccount, ...prev]);
    return newAccount;
  }, []);

  const updateAccount = useCallback((id: string, data: UpdateAccountInput) => {
    const now = new Date();
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? { ...account, ...data, updatedAt: now }
          : account
      )
    );
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      accounts,
      getAccountById,
      addAccount,
      updateAccount,
      deleteAccount,
    }),
    [accounts, getAccountById, addAccount, updateAccount, deleteAccount]
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}

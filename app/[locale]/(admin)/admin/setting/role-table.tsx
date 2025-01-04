import React from 'react';

import CreateRoleDialog from '@/app/[locale]/(admin)/admin/setting/create-role-dialog';
import { RoleList } from '@/app/[locale]/(admin)/admin/setting/role-list';

import Tran from '@/components/common/tran';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export async function RoleTable() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <Table className="table-fixed border-none">
        <TableHeader>
          <TableRow>
            <TableHead className="w-52 overflow-x-auto">
              <Tran text="role" />
            </TableHead>
            <TableHead className="w-full overflow-x-auto">
              <Tran text="authorities" />
            </TableHead>
            <TableHead className="w-20 overflow-x-auto" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <RoleList />
        </TableBody>
      </Table>
      <div className="flex w-full justify-end">
        <CreateRoleDialog />
      </div>
    </div>
  );
}

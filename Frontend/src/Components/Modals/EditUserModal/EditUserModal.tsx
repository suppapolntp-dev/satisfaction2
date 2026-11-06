"use client";

import React from "react";
import CreateUserModal, { CreateUserModalProps } from "@/Components/Modals/CreateUserModal";

export type EditUserModalProps = CreateUserModalProps;

export default function EditUserModal(props: EditUserModalProps) {
  return <CreateUserModal {...props} />;
}

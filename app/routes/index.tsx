import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

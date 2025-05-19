"use client";

import { ArrowLeftIcon } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import ChatInput from "./chat-input";
import ChatMessage from "./chat-message";
// Define message types
type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export function EditorSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar> & { children: React.ReactNode }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 p-4 h-full">
        {children}
      </SidebarContent>
    </Sidebar>
  );
}

export function EditorSidebar_({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "Create a landing page for my tech startup",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "I'd be happy to help you create a landing page for your tech startup. Let me create a modern, responsive landing page with key sections like hero, features, testimonials, and contact form. Here's what I've built:",
      timestamp: new Date(Date.now() - 1000 * 60 * 29),
    },
    {
      id: "3",
      role: "assistant",
      content:
        '```jsx\n// This is a code snippet for the landing page\nimport { Button } from \'@/components/ui/button\';\n\nexport default function LandingPage() {\n  return (\n    <div className="min-h-screen">\n      <header className="py-6 px-4 md:px-6 lg:px-8">\n        <nav className="flex items-center justify-between">\n          <div className="font-bold text-xl">TechStartup</div>\n          <div className="hidden md:flex space-x-6">\n            <a href="#features">Features</a>\n            <a href="#pricing">Pricing</a>\n            <a href="#testimonials">Testimonials</a>\n            <a href="#contact">Contact</a>\n          </div>\n          <Button>Get Started</Button>\n        </nav>\n      </header>\n      {/* Hero section would go here */}\n    </div>\n  );\n}\n```',
      timestamp: new Date(Date.now() - 1000 * 60 * 28),
    },
    {
      id: "4",
      role: "user",
      content: "Can you add a dark mode toggle to it?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "5",
      role: "assistant",
      content:
        "I'll add a dark mode toggle to your landing page. Here's the implementation using a theme provider and a toggle button:",
      timestamp: new Date(Date.now() - 1000 * 60 * 14),
    },
    {
      id: "6",
      role: "assistant",
      content:
        "```jsx\n// ThemeToggle.jsx\nimport { Moon, Sun } from 'lucide-react';\nimport { Button } from '@/components/ui/button';\nimport { useTheme } from '@/components/theme-provider';\n\nexport function ThemeToggle() {\n  const { theme, setTheme } = useTheme();\n\n  return (\n    <Button\n      variant=\"ghost\"\n      size=\"icon\"\n      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}\n    >\n      <Sun className=\"h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0\" />\n      <Moon className=\"absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100\" />\n      <span className=\"sr-only\">Toggle theme</span>\n    </Button>\n  );\n}\n```",
      timestamp: new Date(Date.now() - 1000 * 60 * 13),
    },
    {
      id: "7",
      role: "user",
      content:
        "That looks great! Can you show me how the full page would look?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputValue("");

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm working on your request. Here's a preview of the full landing page in the browser panel on the right.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Back to Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        <div className="space-y-6 p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
        />
        <p className="text-xs text-gray-500 text-center">
          Lily may make mistakes. Please use with discretion.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

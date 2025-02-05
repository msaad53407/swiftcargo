import { ChatSidebar } from "@/components/layout/ChatLayout";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="h-[calc(100svh-100px)] w-full relative flex items-center justify-center">
      <div className="absolute left-3 top-1">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden -ml-2 mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="h-[80vh] overflow-y-auto">
              <ChatSidebar />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <h2>Select a Chat to get Started</h2>
    </div>
  );
}

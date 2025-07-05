"use client"

import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLinkIcon, ServerIcon, XIcon } from "lucide-react";

interface ServerLink {
  title: string;
  url: string;
  serverNumber?: string;
}

interface DownloadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
  movieTitle: string;
}

export function DownloadDrawer({ isOpen, onClose, downloadUrl, movieTitle }: DownloadDrawerProps) {
  const [serverLinks, setServerLinks] = useState<ServerLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && downloadUrl) {
      fetchServerLinks();
    }
  }, [isOpen, downloadUrl]);

  const fetchServerLinks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/servers?url=${encodeURIComponent(downloadUrl)}`);
      const result = await response.json();
      
      if (result.success) {
        setServerLinks(result.data.servers || []);
      } else {
        setError(result.error || 'Failed to fetch server links');
      }
    } catch (err) {
      setError('Failed to load server links');
    } finally {
      setLoading(false);
    }
  };

  const handleServerClick = (serverUrl: string) => {
    // Open in the same tab
    window.location.href = serverUrl;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-lg font-semibold line-clamp-2">
                Download Options
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {movieTitle}
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 ml-2"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading server links...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-destructive font-medium">Error loading servers</div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="space-y-2">
                <Button onClick={fetchServerLinks} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Server Links */}
              {serverLinks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Available Servers</h3>
                    <Badge variant="secondary" className="text-xs">
                      {serverLinks.length} server{serverLinks.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {serverLinks.map((server, index) => (
                      <Card key={index} className="transition-colors hover:bg-muted/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                <ServerIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {server.title}
                                </h4>
                                {server.serverNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    Server {server.serverNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleServerClick(server.url)}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              <ExternalLinkIcon className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {serverLinks.length === 0 && !loading && !error && (
                <div className="text-center py-8 space-y-4">
                  <ServerIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">No server links found</p>
                    <p className="text-sm text-muted-foreground">
                      Please try again later or contact support
                    </p>
                  </div>
                  <Button onClick={fetchServerLinks} variant="outline" className="w-full">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <span>Choose your preferred server</span>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

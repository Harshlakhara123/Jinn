"use client";

import{
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
}from "unique-names-generator";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SparkleIcon } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import {FaGithub} from "react-icons/fa";

import {ProjectsList} from "./projects-list";
import { useCreateProject } from "../hooks/use-projects";
import { useEffect, useState } from "react";
import { ProjectsCommandDialog } from "./projects-command-dialog";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ProjectsView = () => {
  const createProject = useCreateProject();

  const [commandDialogOpen , setCommandDialogOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(e.metaKey || e.ctrlKey){
        if(e.key === "k"){
          e.preventDefault();
          setCommandDialogOpen(true);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
          <div className="flex justify-between gap-4 w-full items-center">
            <div className="flex items-center gap-2 w-full group/logo">
              <img
                src="/jinn-icon.svg"
                alt="Jinn"
                className="w-6 h-6 md:w-11 md:h-11"
              />
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-semibold",
                  font.className
                )}
              >
                Jinn
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const projectName = uniqueNamesGenerator({
                    dictionaries: [
                      adjectives,
                      animals, 
                      colors
                    ],
                    separator: "-",
                    length:3,
                  });


                  createProject({
                    name: projectName,
                  })
                }}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">ctrl + j</Kbd>
                </div>
                <div>
                  <span className="text-sm">New Project</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => {}}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4" />
                  <Kbd className="bg-accent border">ctrl + I</Kbd>
                </div>
                <div>
                  <span className="text-sm">import</span>
                </div>
              </Button>
            </div>
            <ProjectsList onViewAll={() => setCommandDialogOpen(true)}/>
          </div>
        </div>
      </div>
    </>
  );
};
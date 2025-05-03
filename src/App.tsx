import "./globals.css";
import "./index.css";
import { FileBrowser } from "./FileBrowser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { GithubIcon } from "lucide-react";
import { useEffect, useState } from "react";


export function App() {
    const [starCount, setStarCount] = useState<number | null>(null);

    useEffect(() => {
        fetch("https://api.github.com/repos/tabarra/yasss")
            .then(response => response.json())
            .then(data => setStarCount(data.stargazers_count))
            .catch(error => console.error("Error fetching GitHub stars:", error));
    }, []);

    return (
        <div className="w-screen h-screen p-4 md:p-6">
            <div className="container max-w-[80rem] mx-auto">
                <div className="mb-4 flex justify-between items-end gap-2">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <h1 className="text-5xl font-semibold tracking-wider italic">
                            Yasss <small className="text-2xl not-italic">💅</small>
                        </h1>
                        <small className="pl-2 text-muted-foreground tracking-wider">
                            (Yet Another Stupid Storage Server)
                        </small>
                    </div>
                    <div className="flex flex-col">
                        <a href="https://github.com/tabarra/yasss" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="flex items-center gap-2">
                                <GithubIcon size={16} />
                                Star us on GitHub
                                {starCount !== null && (
                                    <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                                        {starCount}
                                    </span>
                                )}
                            </Button>
                        </a>
                    </div>
                </div>

                <Card className="bg-card/50 backdrop-blur-sm border-muted">
                    <CardContent className="p-4 md:p-6">
                        <FileBrowser />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App;

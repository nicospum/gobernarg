import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Bot, Volume2, Send } from "lucide-react";
import { Textarea } from "./ui/textarea";

export function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [lastResponse, setLastResponse] = useState("");

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop speech recognition
    if (!isListening) {
      setInputText("Listening...");
      // Simulate speech recognition after 2 seconds
      setTimeout(() => {
        setInputText("What's the current unemployment rate?");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      // Simulate AI response
      const responses = [
        "The current unemployment rate is 3.8%, down from 4.2% last quarter. This improvement is largely due to the job creation programs in the manufacturing and technology sectors.",
        "Based on current trends, I recommend increasing healthcare funding by 12% to address the nursing shortage and improve patient care metrics.",
        "Your approval rating has increased by 5 points this month. The economic policies are resonating well with middle-income voters.",
        "I suggest scheduling a town hall meeting next week to address the environmental concerns raised in the capital protests.",
        "The education reform initiative is progressing well. Test scores have improved by 8% in pilot schools."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setLastResponse(randomResponse);
      setInputText("");
    }
  };

  const speakResponse = () => {
    // In a real implementation, this would use text-to-speech
    console.log("Speaking:", lastResponse);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? "Listening..." : "Ready"}
          </Badge>
          {isListening && (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex gap-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={toggleListening}
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? "Stop" : "Voice"}
          </Button>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Type your question or use voice input..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-20"
            disabled={isListening}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!inputText.trim() || isListening}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        </div>

        {/* Last Response */}
        {lastResponse && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Response:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={speakResponse}
                className="p-1 h-auto"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              {lastResponse}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Quick Questions:</span>
          <div className="grid grid-cols-1 gap-1">
            {[
              "Economic outlook",
              "Policy recommendations",
              "Public sentiment",
              "Budget analysis"
            ].map((question) => (
              <Button
                key={question}
                variant="ghost"
                size="sm"
                onClick={() => setInputText(question)}
                className="justify-start text-xs h-auto py-1"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

// import { useState, useEffect, useRef } from 'react'; /* Commented out by fix-eslint.js */
import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button'; /* Commented out by fix-eslint.js */
import BarcodeInput from '@/components/forms/BarcodeInput';
import { useRouter } from 'next/navigation';

interface Operation {
  id: string;
  operationId: string;
  description: string;
  standardTimeSeconds: number | null;
  toolsRequired: string | null;
  qualityCheck: string | null;
  sequenceNumber: number;
}

interface TimeStudyProps {
  processId: string;
  processName: string;
  operations: Operation[];
}

export default function TimeStudy({ processId, processName, operations }: TimeStudyProps) {
  const _router = useRouter();
  const [currentOperationIndex, setCurrentOperationIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success&apos; | &apos;error&apos; | &apos;info&apos; } | null>(null);
  
  // Fix: Add a ref to track if a session has been created
  const sessionCreatedRef = useRef(false);
  
  const currentOperation = operations[currentOperationIndex];
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning) {
      interval = setInterval(() => {
        if (startTime) {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, startTime]);
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };
  
  const handleScan = async (data: string) => {
    const command = data.trim().toLowerCase();
    
    if (command === 'start') {
      if (timerRunning) {
        setMessage({ text: 'Timer is already running', type: 'error&apos; });
        return;
      }
      
      // Start timer
      const now = new Date();
      setStartTime(now);
      setTimerRunning(true);
      setMessage({ text: 'Timer started', type: &apos;success&apos; });
      
      try {
        // Create or update session
        if (!sessionId || !sessionCreatedRef.current) {
          // Create new session
          const response = await fetch('/api/time-study/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              processId,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create session');
          }
          
          const data = await response.json();
          // Fix: Set sessionId first, then wait a moment before proceeding
          setSessionId(data.sessionId);
          sessionCreatedRef.current = true;
          
          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Start operation timing with the newly created sessionId
          const startResponse = await fetch('/api/time-study/operations/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: data.sessionId, // Use data.sessionId directly instead of state
              operationId: currentOperation.id,
              startTime: now.toISOString(),
            }),
          });
          
          if (!startResponse.ok) {
            throw new Error('Failed to start operation timing');
          }
        } else {
          // If session already exists, just start the operation timing
          const startResponse = await fetch('/api/time-study/operations/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: sessionId,
              operationId: currentOperation.id,
              startTime: now.toISOString(),
            }),
          });
          
          if (!startResponse.ok) {
            throw new Error('Failed to start operation timing');
          }
        }
      } catch (error) {
        console.error('Error starting time study:', error);
        setMessage({ text: 'Error starting timer', type: &apos;error&apos; });
        // Reset timer state on error
        setTimerRunning(false);
        setStartTime(null);
      }
    } else if (command === 'end') {
      if (!timerRunning) {
        setMessage({ text: 'Timer is not running', type: &apos;error&apos; });
        return;
      }
      
      // Stop timer
      const endTime = new Date();
      setTimerRunning(false);
      setMessage({ text: 'Timer stopped', type: &apos;success&apos; });
      
      try {
        // End operation timing
        const response = await fetch('/api/time-study/operations/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            operationId: currentOperation.id,
            endTime: endTime.toISOString(),
            totalTimeSeconds: elapsedTime,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to end operation timing');
        }
        
        // Fix: Wait a moment before moving to next operation to ensure state is updated
        setTimeout(() => {
          // Move to next operation
          const nextIndex = (currentOperationIndex + 1) % operations.length;
          setCurrentOperationIndex(nextIndex);
          setElapsedTime(0);
          setStartTime(null);
          
          // If we've completed the cycle, reset session
          if (nextIndex === 0) {
            setSessionId(null);
            // Fix: Reset session created flag
            sessionCreatedRef.current = false;
            setMessage({ text: 'Operation cycle completed', type: 'info&apos; });
          }
        }, 100);
      } catch (error) {
        console.error('Error ending time study:', error);
        setMessage({ text: 'Error stopping timer', type: &apos;error&apos; });
      }
    } else {
      setMessage({ text: 'Invalid command. Please scan &quot;start&quot; or "end"', type: &apos;error&apos; });
    }
  };
  
  const handleChangeOperation = () => {
    if (timerRunning) {
      setMessage({ text: 'Cannot change operation while timer is running', type: 'error&apos; });
      return;
    }
    
    router.push('/dashboard/operator');
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Study: {processName}</h1>
        <Button 
          variant="secondary" 
          onClick={handleChangeOperation}
          disabled={timerRunning && currentOperationIndex !== 0}
        >
          Change Operation
        </Button>
      </div>
      
      <Card title={`Operation: ${currentOperation.operationId}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Operation ID</p>
              <p className="font-medium">{currentOperation.operationId}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Standard Time</p>
              <p className="font-medium">
                {currentOperation.standardTimeSeconds 
                  ? `${currentOperation.standardTimeSeconds} seconds` 
                  : 'Not specified'}
              </p>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{currentOperation.description}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Tools Required</p>
              <p className="font-medium">{currentOperation.toolsRequired || 'None'}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Quality Check</p>
              <p className="font-medium">{currentOperation.qualityCheck || 'None'}</p>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${timerRunning ? 'text-green-600&apos; : ''}`}>
                {formatTime(elapsedTime)}
              </div>
              <p className="text-gray-500 mt-2">
                {timerRunning ? 'Timer Running&apos; : 'Timer Stopped'}
              </p>
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded-md ${
              message.type === 'success&apos; ? &apos;bg-green-50 text-green-600&apos; :
              message.type === &apos;error&apos; ? &apos;bg-red-50 text-red-600&apos; :
              &apos;bg-blue-50 text-blue-600&apos;
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Scan &quot;start&quot; to begin or &quot;end&quot; to complete this operation
            </p>
            <BarcodeInput 
              onScan={handleScan} 
              placeholder="Scan &apos;start&apos; or &apos;end&apos;..." 
              buttonText="Submit"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

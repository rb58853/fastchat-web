import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const ADDITIONAL_SERVERS_STORAGE_KEY = 'fastchat-additional-servers';

const readAdditionalServersFromStorage = () => {
  try {
    const raw = localStorage.getItem(ADDITIONAL_SERVERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

const buildWsUrl = () => {
  const rawBaseUrl = (process.env.REACT_APP_WS_URL || '').trim();
  const fallbackPath = '/';

  const toWsUrl = (input) => {
    const parsedUrl = new URL(input || fallbackPath, window.location.origin);

    if (parsedUrl.protocol === 'http:') parsedUrl.protocol = 'ws:';
    if (parsedUrl.protocol === 'https:') parsedUrl.protocol = 'wss:';

    return parsedUrl;
  };

  let url;

  try {
    url = toWsUrl(rawBaseUrl);
  } catch (error) {
    console.error('Invalid REACT_APP_WS_URL, using fallback URL.', error);
    url = toWsUrl(fallbackPath);
  }

  url.pathname = '/chat/admin';

  const chatId = (process.env.REACT_APP_CHAT_ID || '').trim();
  if (chatId) {
    url.searchParams.set('chat_id', chatId);
  } else {
    url.searchParams.delete('chat_id');
  }

  const token = (process.env.REACT_APP_TOKEN || '').trim();
  if (token) url.searchParams.set('token', token);

  return url.toString();
};

export default function useChatLogic() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState('');
  const wsRef = useRef(null);
  const additionalServersSentRef = useRef(false);
  const messageIdRef = useRef(0);
  const workflowKeyRef = useRef(0);
  const currentSubqueryIdRef = useRef(null);

  const nextMessageId = useCallback((prefix) => `${prefix}-${messageIdRef.current++}`, []);

  const hasRenderableData = useCallback((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }, []);

  const appendWorkflowStep = useCallback((label, tone = 'neutral') => {
    if (!label) return;

    setActiveWorkflowStep(label);
    setWorkflowSteps((prev) => {
      const next = [...prev, { id: `workflow-${workflowKeyRef.current++}`, label, tone }];
      return next.slice(-4);
    });
  }, []);

  const isLoadingActionStep = useCallback((stepTitle, stepMessage) => {
    const combined = `${stepTitle} ${stepMessage}`.toLowerCase();

    return (
      /haciendo esta accion|doing this action/.test(combined) ||
      /select service/.test(combined) ||
      /select the most appropriate service for the current query/.test(combined) ||
      /select prompts/.test(combined) ||
      /select the mosts? appropriates? prompts? for the current query/.test(combined) ||
      /task query decomposer/.test(combined) ||
      /separate it into service-specific calls/.test(combined)
    );
  }, []);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setActiveWorkflowStep('');
  }, []);

  const describeWorkflowStep = useCallback((step) => {
    if (step.type === 'query') {
      return { label: t.workflow.interpreting, tone: 'neutral' };
    }

    if (step.type === 'data') {
      return { label: t.workflow.consultingData, tone: 'neutral' };
    }

    if (step.type === 'step') {
      const stepTitle = typeof step.step === 'string' ? step.step.trim() : '';
      const stepMessage = typeof step.message === 'string' ? step.message.trim() : '';

      if (stepTitle && stepMessage) {
        return {
          label: `${stepTitle}: ${stepMessage}`,
          tone: isLoadingActionStep(stepTitle, stepMessage) ? 'accent' : 'neutral',
        };
      }

      if (stepMessage) {
        return { label: stepMessage, tone: 'neutral' };
      }

      return {
        label: stepTitle || t.workflow.processing,
        tone: 'neutral',
      };
    }

    return null;
  }, [isLoadingActionStep, t]);

  const handleStep = useCallback((step) => {
    const workflowDescriptor = describeWorkflowStep(step);

    if (workflowDescriptor) {
      appendWorkflowStep(workflowDescriptor.label, workflowDescriptor.tone);
    }

    const ensureSubquery = (currentMessages) => {
      if (currentSubqueryIdRef.current) {
        const exists = currentMessages.some((msg) => msg.kind === 'subquery' && msg.id === currentSubqueryIdRef.current);
        if (exists) return [currentMessages, currentSubqueryIdRef.current];
      }

      const subqueryId = nextMessageId('subquery');
      const nextMessages = [
        ...currentMessages,
        {
          id: subqueryId,
          kind: 'subquery',
          sections: [],
        },
      ];
      currentSubqueryIdRef.current = subqueryId;
      return [nextMessages, subqueryId];
    };

    setMessages((prev) => {
      let [updated, subqueryId] = ensureSubquery(prev);

      if (step.type === "query") {
        const queryText = typeof step.query === 'string' ? step.query.trim() : '';
        if (!queryText) return updated;

        const newSubqueryId = nextMessageId('subquery');
        currentSubqueryIdRef.current = newSubqueryId;
        return [
          ...updated,
          {
            id: newSubqueryId,
            kind: 'subquery',
            sections: [
              {
                id: nextMessageId('section'),
                type: 'query',
                query: queryText,
              },
            ],
          },
        ];
      }

      if (step.type === "data") {
        const hasVisibleData = step.data && Object.values(step.data).some((value) => hasRenderableData(value));

        if (hasVisibleData) {
          return updated.map((msg) => {
            if (msg.id !== subqueryId || msg.kind !== 'subquery') return msg;
            const sections = [...msg.sections];
            const lastSection = sections[sections.length - 1];

            if (lastSection && lastSection.type === 'data') {
              sections[sections.length - 1] = {
                ...lastSection,
                data: {
                  ...(lastSection.data || {}),
                  ...(step.data || {}),
                },
              };

              return {
                ...msg,
                sections,
              };
            }

            return {
              ...msg,
              sections: [
                ...sections,
                {
                  id: nextMessageId('section'),
                  type: 'data',
                  data: step.data,
                },
              ],
            };
          });
        }
        return updated;
      }

      if (step.type === "step") {
        const stepTitle = typeof step.step === 'string' ? step.step.trim() : '';
        const stepMessage = typeof step.message === 'string' ? step.message.trim() : '';
        const loadingOnlyStep = isLoadingActionStep(stepTitle, stepMessage);

        if (loadingOnlyStep) {
          return updated;
        }

        if (stepTitle && stepMessage) {
          return updated.map((msg) => {
            if (msg.id !== subqueryId || msg.kind !== 'subquery') return msg;
            return {
              ...msg,
              sections: [
                ...msg.sections,
                {
                  id: nextMessageId('section'),
                  type: 'step',
                  step: stepTitle,
                  message: stepMessage,
                },
              ],
            };
          });
        }
        return updated;
      }

      if (step.type === 'response') {
        return updated.map((msg) => {
          if (msg.id !== subqueryId || msg.kind !== 'subquery') return msg;

          const sections = [...msg.sections];
          const responseIndex = [...sections].reverse().findIndex((section) => section.type === 'response');

          if (step.first_chunk || responseIndex === -1) {
            sections.push({
              id: nextMessageId('section'),
              type: 'response',
              response: step.response || '',
            });
            return { ...msg, sections };
          }

          const absoluteIndex = sections.length - 1 - responseIndex;
          const currentResponse = sections[absoluteIndex].response || '';
          sections[absoluteIndex] = {
            ...sections[absoluteIndex],
            response: `${currentResponse}${step.response || ''}`,
          };
          return { ...msg, sections };
        });
      }

      return updated;
    });
  }, [appendWorkflowStep, describeWorkflowStep, hasRenderableData, isLoadingActionStep, nextMessageId]);

  useEffect(() => {
    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;
    additionalServersSentRef.current = false;

    ws.onopen = () => {
      console.log("✅ Conectado al servidor WebSocket");
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : '';
      const normalizedData = data.trim().toLowerCase();

      if (normalizedData === '--eof') {
        stopProcessing();
        return;
      }

      try {
        const step = JSON.parse(data);
        handleStep(step);
      } catch (err) {
        console.error("Error procesando mensaje:", data, err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      stopProcessing();
    };

    ws.onerror = (err) => {
      console.error("⚠️ Error WebSocket:", err);
      setConnectionStatus('disconnected');
      stopProcessing();
    };

    return () => {
      ws.close();
    };
  }, [handleStep, stopProcessing]);

  const sendMessage = () => {
    if (input.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      const submittedInput = input.trim();
      const additionalServers = readAdditionalServersFromStorage();

      if (!additionalServersSentRef.current) {
        if (additionalServers && Object.keys(additionalServers).length > 0) {
          wsRef.current.send(
            JSON.stringify({
              type: 'additional_servers',
              data: additionalServers,
            }),
          );
        }
        additionalServersSentRef.current = true;
      }

      wsRef.current.send(input);
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId('user'),
          kind: 'user',
          input: submittedInput,
        },
      ]);
      currentSubqueryIdRef.current = null;
      setIsProcessing(true);
      setWorkflowSteps([
        {
          id: `workflow-${workflowKeyRef.current++}`,
          label: t.workflow.preparingContext,
          tone: 'accent',
        },
      ]);
      setActiveWorkflowStep(t.workflow.preparingContext);
      setInput("");
    }
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    connectionStatus,
    isProcessing,
    workflowSteps,
    activeWorkflowStep,
  };
}

import { useState, useRef, useEffect } from 'react';
import { Send, Download, Copy, SkipForward, Loader2, CheckCircle2, Sun, Moon, Share2 } from 'lucide-react';

// Simple compression for URL state
const compress = (str) => {
  try {
    return encodeURIComponent(btoa(encodeURIComponent(str)));
  } catch (e) {
    return encodeURIComponent(str);
  }
};

const decompress = (str) => {
  try {
    return decodeURIComponent(atob(decodeURIComponent(str)));
  } catch (e) {
    return null;
  }
};

export default function BragDocBuilder() {
  const [darkMode, setDarkMode] = useState(true);
  const [mode, setMode] = useState(null); // 'general' or 'founder'
  const [timeframe, setTimeframe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState('mode'); // mode, timeframe, collecting, generating, complete
  const [bragDoc, setBragDoc] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [collectedData, setCollectedData] = useState({
    projects: [],
    collaboration: [],
    design: [],
    companyBuilding: [],
    learned: [],
    outside: []
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after assistant responds
  useEffect(() => {
    if (!isLoading && conversationState === 'collecting' && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading, conversationState]);

  // Load state from URL on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decompressed = decompress(hash);
        if (decompressed) {
          const state = JSON.parse(decompressed);
          setMode(state.mode);
          setTimeframe(state.timeframe);
          setMessages(state.messages || []);
          setConversationState(state.conversationState);
          setBragDoc(state.bragDoc || '');
          setCollectedData(state.collectedData || {
            projects: [],
            collaboration: [],
            design: [],
            companyBuilding: [],
            learned: [],
            outside: []
          });
        }
      } catch (e) {
        console.error('Failed to restore state from URL:', e);
      }
    }
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (conversationState !== 'mode' && conversationState !== 'timeframe' && messages.length > 0) {
      const state = {
        mode,
        timeframe,
        messages,
        conversationState,
        bragDoc,
        collectedData
      };
      try {
        const compressed = compress(JSON.stringify(state));
        window.history.replaceState(null, '', `#${compressed}`);
      } catch (e) {
        console.error('Failed to save state to URL:', e);
      }
    }
  }, [mode, timeframe, messages, conversationState, bragDoc, collectedData]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const selectMode = (m) => {
    setMode(m);
    setConversationState('timeframe');
  };

  const selectTimeframe = (tf) => {
    setTimeframe(tf);
    setConversationState('collecting');
    const timeframeText = tf === 'daily' ? 'today' : tf === 'weekly' ? 'this week' : 'this sprint';
    addMessage('assistant', `Great! Let's capture what you worked on ${timeframeText}. What did you work on? Tell me about 1-2 things that stood out.`);
  };

  const callClaude = async (userMessage) => {
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const systemPrompt = mode === 'founder'
      ? `You are helping a startup founder create a brag document entry. Your role is to extract BUSINESS VALUE, STRATEGIC IMPACT, and LEARNING behind their work. Push past vague answers to get concrete outcomes.

CRITICAL RULES:
1. Ask 2-4 follow-up questions per topic - don't accept vague answers
2. Focus on BUSINESS OUTCOMES: revenue, customers, team velocity, strategic decisions, market insights
3. Push for quantification: $ amounts, number of customers, team members affected, time scales
4. Extract implicit learning: Strategic decisions and frameworks ARE learning - ask "What insight led to this?"
5. Be conversational but persistent - if an answer is vague, ask again more specifically
6. Cover founder-relevant categories: Customer Impact, Team & Velocity, Strategic Decisions, Learning
7. Keep responses SHORT - 1-2 sentences per question

FOUNDER-SPECIFIC IMPACT EXTRACTION:
- "What was the CUSTOMER/REVENUE impact?" (new customers, $ closed, retention signal, churn prevented)
- "How many people did this unblock? From what? For how long?"
- "What was the STRATEGIC reasoning?" (why this vs alternatives, what it enables, resource allocation)
- "What did this teach you about your market/product/team/yourself?"
- "Would you mention this to your board/investors? Why?"
- "What was the business risk if you DIDN'T do this?"

RED FLAGS FOR FOUNDERS - These need follow-up:
- Missing $ amounts when revenue is involved → Ask "How much specifically?"
- Vague team references ("the team") → Ask "How many people? Which team?"
- Strategy without reasoning → Ask "What insight led you to this approach?"
- Work without learning → Ask "What did you learn about your business/market?"
- "Important" without defining why → Ask "What's the business impact?"

CAPTURE IMPLIED LEARNING:
- Decision frameworks ("We decided to focus on X before Y") → "What led you to prioritize this way?"
- Strategic insights ("alignment on what/why before how") → "What did you learn about effective process?"
- Problem-solving approaches → "What would you do differently next time?"
- Trade-off decisions → "What did this teach you about resource allocation?"

When you have captured 1-2 work items with CONCRETE business impact and learning, say "Great! I have what I need." Do NOT generate the brag doc yourself.

Current timeframe: ${timeframe}
Collected so far: ${JSON.stringify(collectedData)}`
      : `You are helping someone create a brag document entry. Your role is to extract the VALUE and IMPACT behind their work through thoughtful questions. Push past vague answers to get concrete outcomes.

CRITICAL RULES:
1. Ask 2-4 follow-up questions per topic - don't accept vague answers
2. Focus on OUTCOMES over activities: What changed? What shipped? What was learned?
3. Push for quantification: numbers, metrics, scale (team size, revenue, time saved, % improved)
4. Uncover hidden learning: Even routine work teaches something - ask "What did you learn?" or "What would you do differently?"
5. Mine for "fuzzy work": mentoring, culture building, process improvements
6. Be conversational but persistent - if an answer is vague, ask again more specifically
7. Cover these categories: Projects, Collaboration/Mentorship, Design/Documentation, Learning
8. Keep responses SHORT - 1-2 sentences per question

IMPACT EXTRACTION - Ask until you get concrete answers:
- "What was the BUSINESS impact?" (revenue gained/protected, customers affected, deals closed)
- "What QUANTIFIABLE outcome resulted?" (X% faster, saved $Y, N people helped, Z hours saved)
- "What would have happened if you DIDN'T do this?" (opportunity cost, risk averted)
- "What did YOU learn from this?" (skills, insights, better approach next time)
- "Who specifically benefited and how?" (team, customers, company)

RED FLAGS - These need follow-up:
- Vague time references ("a while", "some time") → Ask "How long specifically?"
- Missing scale ("the team") → Ask "How many people?"
- No outcome mentioned → Ask "What was the result?"
- Process work without impact → Ask "What changed after you did this?"
- No learning captured → Ask "What insight did you gain from this work?"

CAPTURE IMPLIED LEARNING:
- When they describe an approach or decision → "What insight led you to this approach?"
- When they solve a problem → "What would you do differently next time?"
- Strategic thinking and decision frameworks ARE learning to capture

AVOID:
- Accepting "it was important" without WHY
- Letting numeric opportunities slide (always ask for numbers)
- Stopping before learning is captured
- Duplicating the same work across multiple categories

When you have captured 1-2 work items with CONCRETE impact and outcomes, say "Great! I have what I need." Do NOT generate the brag doc yourself.

Current timeframe: ${timeframe}
Collected so far: ${JSON.stringify(collectedData)}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      const claudeResponse = data.content[0].text;

      if (claudeResponse.toLowerCase().includes("i have what i need") || 
          claudeResponse.toLowerCase().includes("great! i have") ||
          claudeResponse.toLowerCase().includes("i think i have enough")) {
        setConversationState('generating');
        await generateBragDoc();
        addMessage('assistant', "Perfect! I've generated your brag doc entry. You can copy it or download it below.");
      } else {
        addMessage('assistant', claudeResponse);
      }
    } catch (error) {
      console.error('Error calling Claude:', error);
      addMessage('assistant', "Sorry, I encountered an error. Please try again.");
    }
  };

  const generateBragDoc = async () => {
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const generationPrompt = mode === 'founder'
      ? `Based on our conversation, generate a founder-focused brag document entry in markdown format.

USE THIS EXACT STRUCTURE:

## ${new Date().toISOString().split('T')[0]} - ${timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Sprint'} Entry

### Customer & Revenue Impact
[List work that directly affected customers, revenue, or product-market fit. Each bullet must show: WHAT + BUSINESS IMPACT + METRICS. Include: $ amounts, customer count, retention signals, deal values. If nothing discussed, write "None this period."]

### Team & Velocity
[List work that unblocked people, improved team speed, or built culture. Show: WHO was affected (how many people), WHAT they were blocked on, TIME saved/delays prevented. If nothing discussed, write "None this period."]

### Strategic Decisions & Insights
[List resource allocation choices, strategic pivots, market insights, or decision frameworks. Show: WHAT you decided + WHY (the reasoning/insight) + WHAT it enables. If nothing discussed, write "None this period."]

### What I Learned
[CRITICAL: Capture strategic insights, decision frameworks, and mental models developed. Even routine founder work teaches about market, team, product, or self. Strategic thinking like "alignment on what/why before how" IS learning. If genuinely nothing, write "None this period."]

CRITICAL FORMATTING FOR FOUNDERS:
- Lead with business impact: revenue, customers, velocity, market insight
- Include ALL metrics: $ amounts, team sizes, time scales, customer counts
- Show strategic reasoning: "Decided to X (instead of Y) because Z, enabling W"
- Capture what you learned about running your business
- Examples of good founder bullets:
  * "Unblocked 5-person DevOps team from day-long deployment blocker, preventing delays on critical $500K portal launch for flagship enterprise customer"
  * "Closed initial setup for new $10K MRR client, establishing core service delivery that validates pricing model"
  * "Guided 3-person dev team toward alignment on strategic approach before tactical implementation, learning that 'what/why before how' reduces rework cycles"
  * "Learned: Forcing alignment on objectives before discussing implementation reduces technical rework and builds team ownership"

Generate ONLY the markdown, no additional commentary.`
      : `Based on our conversation, generate a brag document entry in markdown format.

USE THIS EXACT STRUCTURE:

## ${new Date().toISOString().split('T')[0]} - ${timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Sprint'} Entry

### Projects
[List work items focused on OUTCOMES and VALUE delivered. Each bullet must show: WHAT you did + WHY it mattered + RESULT/IMPACT. Include metrics. If nothing discussed, write "None this period."]

### Collaboration & Mentorship  
[ONLY list work that is primarily about helping others - mentoring, code reviews, unblocking teammates. Do NOT duplicate items from Projects. If nothing discussed, write "None this period."]

### Design & Documentation
[List docs, designs, or technical writing. Include purpose/impact. If nothing discussed, write "None this period."]

### What I Learned
[CRITICAL: Extract learning even from routine work - insights about process, approach, decisions, or what you'd do differently. Strategic thinking and decision frameworks ARE learning. If genuinely nothing was learned, write "None this period."]

CRITICAL FORMATTING RULES:
- Focus on OUTCOMES not activities: "Shipped X resulting in Y" not "Worked on X"
- Include ALL numbers/metrics mentioned: team size, time saved, revenue, % improvement, days blocked, etc.
- Show business impact: revenue protected, deals enabled, customers helped, risks averted
- Each bullet: Action Verb + What + Impact + (Metric if available)
- Examples of good bullets:
  * "Unblocked 5-person DevOps team from day-long blocker on critical $500K portal launch, preventing further schedule delays"
  * "Designed and implemented onboarding sequence for new $10K/month client, establishing core revenue-generating service delivery"
  * "Shaped technical strategy for agentic development integration, aligning 3-person dev team on approach before implementation"
- Avoid duplicating the same work in multiple sections
- Use active, specific language: "Led", "Shipped", "Unblocked", "Designed", "Scaled"
- Capture insights and decision frameworks in Learning section

Generate ONLY the markdown, no additional commentary.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            ...conversationHistory,
            { role: 'user', content: generationPrompt }
          ]
        })
      });

      const data = await response.json();
      let markdown = data.content[0].text;
      markdown = markdown.replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();
      
      setBragDoc(markdown);
      setConversationState('complete');
    } catch (error) {
      console.error('Error generating brag doc:', error);
      addMessage('assistant', "Sorry, I had trouble generating the document. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const message = userInput;
    setUserInput('');
    addMessage('user', message);
    setIsLoading(true);

    await callClaude(message);
    setIsLoading(false);
  };

  const handleSkip = async () => {
    if (isLoading) return;
    
    addMessage('user', '[Skipped]');
    setIsLoading(true);
    
    await callClaude("Skip to the next question or finish if we have enough.");
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bragDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareConversation = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareUrlCopied(true);
    setTimeout(() => setShareUrlCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([bragDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brag-doc-${mode}-${timeframe}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetTool = () => {
    setMode(null);
    setTimeframe(null);
    setMessages([]);
    setUserInput('');
    setConversationState('mode');
    setBragDoc('');
    setCollectedData({
      projects: [],
      collaboration: [],
      design: [],
      companyBuilding: [],
      learned: [],
      outside: []
    });
    window.history.replaceState(null, '', window.location.pathname);
  };

  const bgGradient = darkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-slate-900/50' : 'bg-white/80';
  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';
  const inputBg = darkMode ? 'bg-slate-800' : 'bg-slate-100';
  const inputBorder = darkMode ? 'border-slate-700' : 'border-slate-300';
  const buttonSecondary = darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 border-slate-300';
  const messageBg = darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200';
  const previewBg = darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`min-h-screen ${bgGradient} ${textPrimary} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Brag Doc Builder
              </h1>
              <p className={`${textSecondary} text-sm mt-1`}>
                Extract the value behind your work • Scale without the friction
              </p>
            </div>
            <div className="flex items-center gap-3">
              {conversationState !== 'mode' && conversationState !== 'timeframe' && (
                <button
                  onClick={shareConversation}
                  className={`${buttonSecondary} ${textSecondary} border rounded-lg px-4 py-2 transition-all flex items-center gap-2 text-sm`}
                  title="Copy shareable URL"
                >
                  {shareUrlCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${buttonSecondary} ${textSecondary} border rounded-lg p-2 transition-all`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        {conversationState === 'mode' && (
          <div className="max-w-3xl mx-auto">
            <div className={`${cardBg} backdrop-blur border ${cardBorder} rounded-2xl p-8 shadow-xl`}>
              <h2 className="text-xl font-semibold mb-3 text-center">Choose your mode</h2>
              <p className={`${textSecondary} text-sm text-center mb-6`}>
                We'll tailor the questions to extract the most relevant impact for your role
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectMode('general')}
                  className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'} hover:from-cyan-600 hover:to-blue-600 border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-cyan-500 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 hover:text-white text-left`}
                >
                  <div className="text-lg font-semibold mb-2">General Mode</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    For employees, contributors, and team members tracking projects, collaboration, and learning
                  </div>
                </button>
                <button
                  onClick={() => selectMode('founder')}
                  className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'} hover:from-cyan-600 hover:to-blue-600 border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-cyan-500 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 hover:text-white text-left`}
                >
                  <div className="text-lg font-semibold mb-2">Founder Mode</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    For startup founders tracking customer impact, team velocity, strategic decisions, and business insights
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Selection */}
        {conversationState === 'timeframe' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${cardBg} backdrop-blur border ${cardBorder} rounded-2xl p-8 shadow-xl`}>
              <h2 className="text-xl font-semibold mb-6 text-center">Choose your timeframe</h2>
              <div className="grid grid-cols-3 gap-4">
                {['daily', 'weekly', 'sprint'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => selectTimeframe(tf)}
                    className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'} hover:from-cyan-600 hover:to-blue-600 border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-cyan-500 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 hover:text-white`}
                  >
                    <div className="text-lg font-semibold capitalize">{tf}</div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                      {tf === 'daily' && 'Today\'s wins'}
                      {tf === 'weekly' && 'This week'}
                      {tf === 'sprint' && 'This sprint'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {conversationState !== 'mode' && conversationState !== 'timeframe' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`${cardBg} backdrop-blur border ${cardBorder} rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]`}>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'
                            : `${messageBg} ${textPrimary} border`
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`${messageBg} border rounded-2xl px-4 py-3 flex items-center gap-2`}>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span className={textSecondary}>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {conversationState === 'collecting' && (
                  <div className={`border-t ${cardBorder} p-4 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-50/80'}`}>
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your response..."
                        className={`flex-1 ${inputBg} border ${inputBorder} rounded-xl px-4 py-3 ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`}
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSkip}
                        disabled={isLoading}
                        className={`${buttonSecondary} border ${textSecondary} rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Skip to next question"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={isLoading || !userInput.trim()}
                        className="bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {conversationState === 'complete' && (
                  <div className={`border-t ${cardBorder} p-4 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-50/80'}`}>
                    <button
                      onClick={resetTool}
                      className="w-full bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl px-6 py-3 transition-all font-medium"
                    >
                      Create Another Entry
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className={`${cardBg} backdrop-blur border ${cardBorder} rounded-2xl shadow-xl p-6 h-[600px] flex flex-col`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Your Brag Doc
                </h3>
                
                {bragDoc ? (
                  <>
                    <div className={`flex-1 overflow-y-auto mb-4 ${previewBg} rounded-xl p-4 border`}>
                      <pre className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} whitespace-pre-wrap font-mono`}>
                        {bragDoc}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className={`flex-1 ${buttonSecondary} border ${textSecondary} rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={downloadMarkdown}
                        className="flex-1 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`flex-1 flex items-center justify-center ${textSecondary} text-sm`}>
                    Your brag doc will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`mt-8 text-center ${textSecondary} text-sm space-y-2`}>
          <p>
            Powered by <a href="https://starfysh.net" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 underline">Starfysh</a> • Turn friction into flow
          </p>
          <p className="text-xs max-w-2xl mx-auto">
            We don't track or store your responses. Your conversation happens directly with Claude. 
            See <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 underline">Anthropic's Privacy Policy</a> for details on how your data is handled.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { getTestById, submitTest } from "../../API/test.api";
import { 
    MdAccessTime, 
    MdCheckCircle, 
    MdArrowForward, 
    MdArrowBack, 
    MdOutlineTimer,
    MdHelpOutline,
    MdWarning
} from "react-icons/md";

const TakeTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]); // { questionId, selectedOption }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testStarted, setTestStarted] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await getTestById(testId);
                setTest(res.data.test);
                setTimeLeft(res.data.test.duration * 60);
            } catch (error) {
                console.error("Error fetching test:", error);
                navigate("/student/tests");
            } finally {
                setLoading(false);
            }
        };
        fetchTest();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testId]);

    const startTimer = () => {
        setTestStarted(true);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOptionSelect = (optionIndex) => {
        const questionId = test.questions[currentQuestion]._id;
        setAnswers(prev => {
            const existing = prev.filter(a => a.questionId !== questionId);
            return [...existing, { questionId, selectedOption: optionIndex }];
        });
    };

    const handleTextAnswer = (text) => {
        const questionId = test.questions[currentQuestion]._id;
        setAnswers(prev => {
            const existing = prev.filter(a => a.questionId !== questionId);
            return [...existing, { questionId, textAnswer: text }];
        });
    };

    const handleAutoSubmit = () => {
        toast("Time is up! Your test will be submitted automatically.", { icon: "⏰" });
        handleSubmit();
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            await submitTest(testId, answers);
            toast.success("Test submitted successfully!");
            navigate("/student/tests");
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit test. Please try again.");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-slate-400">Loading assessment...</div>;

    if (!testStarted) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 sm:p-6 antialiased font-sans">
                <div className="bg-white rounded-2xl p-6 sm:p-12 max-w-xl w-full shadow-sm border border-slate-100 text-center space-y-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                        <MdAccessTime className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{test.title}</h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">{test.description || "Assessment Instructions"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration</p>
                            <p className="text-lg font-black text-slate-900">{test.duration} Min</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items</p>
                            <p className="text-lg font-black text-slate-900">{test.questions.length} Qs</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-3 flex gap-2 text-left border border-amber-100">
                        <MdWarning className="text-amber-600 w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-900 font-bold leading-relaxed">
                            Once started, the timer runs continuously. Do not close or refresh this page.
                        </p>
                    </div>

                    <button 
                        onClick={startTimer}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        Begin Assessment
                        <MdArrowForward className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    const selectedAns = answers.find(a => a.questionId === question._id);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col antialiased font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col">
                        <h2 className="text-sm font-black text-slate-900 line-clamp-1">{test.title}</h2>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Question {currentQuestion + 1} of {test.questions.length}
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 300 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                    <MdOutlineTimer className={`w-4 h-4 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    <span className="text-base font-black font-mono leading-none">{formatTime(timeLeft)}</span>
                </div>

                <button 
                    onClick={() => { if(window.confirm("Submit your assessment?")) handleSubmit(); }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    {isSubmitting ? "Submitting..." : "Finish"}
                </button>
            </header>

            {/* Question Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Content */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {question.type} • {question.marks} Points
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                            {question.questionText}
                        </h3>

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            {(question.type === "mcq" || (question.type === "obt" && question.options?.length > 0)) ? (
                                question.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                            selectedAns?.selectedOption === idx 
                                            ? 'bg-indigo-50 border-indigo-600 shadow-sm' 
                                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                                            selectedAns?.selectedOption === idx 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-400'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-sm sm:text-base font-bold transition-colors ${
                                            selectedAns?.selectedOption === idx ? 'text-indigo-900' : 'text-slate-700'
                                        }`}>
                                            {opt.text}
                                        </span>
                                        {selectedAns?.selectedOption === idx && (
                                            <MdCheckCircle className="ml-auto w-5 h-5 text-indigo-600" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Answer</label>
                                    {question.type === "essay" ? (
                                        <textarea
                                            value={selectedAns?.textAnswer || ""}
                                            onChange={(e) => handleTextAnswer(e.target.value)}
                                            rows="5"
                                            placeholder="Type your response here..."
                                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-sm font-medium transition-all"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={selectedAns?.textAnswer || ""}
                                            onChange={(e) => handleTextAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 text-sm font-bold transition-all"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Map */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Question Map</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {test.questions.map((_, idx) => {
                                const isAnswered = answers.find(a => a.questionId === test.questions[idx]._id);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`h-9 rounded-lg font-black text-[10px] transition-all border ${
                                            currentQuestion === idx 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                            : isAnswered 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                Answered
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                <div className="w-2 h-2 bg-white border border-slate-200 rounded-full"></div>
                                Remaining
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer Navigation */}
            <footer className="bg-white border-t border-slate-100 p-4 sm:px-10 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                <button 
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-1 px-4 py-2 text-[10px] font-black text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all uppercase tracking-widest"
                >
                    <MdArrowBack className="w-4 h-4" />
                    Previous
                </button>

                <div className="hidden sm:flex gap-1.5">
                    {test.questions.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${
                            currentQuestion === idx ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-100'
                        }`}></div>
                    ))}
                </div>

                <button 
                    onClick={() => {
                        if (currentQuestion === test.questions.length - 1) {
                            if(window.confirm("Submit your assessment?")) handleSubmit();
                        } else {
                            setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1));
                        }
                    }}
                    className="flex items-center gap-1 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                >
                    {currentQuestion === test.questions.length - 1 ? "Finish" : "Next Question"}
                    <MdArrowForward className="w-4 h-4" />
                </button>
            </footer>
        </div>
    );
};

export default TakeTest;

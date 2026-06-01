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

    if (loading) return <div className="p-10 text-center font-bold">Loading assessment...</div>;

    if (!testStarted) {
        return (
            <div className="min-h-full flex items-center justify-center p-6">
                <div className="bg-white rounded-[40px] p-10 md:p-16 max-w-2xl w-full shadow-2xl shadow-indigo-500/10 border border-gray-100 text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
                        <MdAccessTime className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{test.title}</h1>
                        <p className="text-gray-500 font-medium">{test.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Time Limit</p>
                            <p className="text-xl font-black text-gray-900">{test.duration} Minutes</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Questions</p>
                            <p className="text-xl font-black text-gray-900">{test.questions.length} Items</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 text-left">
                        <MdWarning className="text-amber-600 w-5 h-5 shrink-0" />
                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                            Once you start, the timer cannot be paused. Closing the browser or navigating away will not stop the timer.
                        </p>
                    </div>

                    <button 
                        onClick={startTimer}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-lg shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                    >
                        Start Assessment
                        <MdArrowForward className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    const selectedAns = answers.find(a => a.questionId === question._id);

    return (
        <div className="min-h-full bg-white flex flex-col">
            {/* Header / Progress */}
            <header className="bg-white border-b border-gray-100 p-4 md:px-10 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-sm font-black text-gray-900 line-clamp-1">{test.title}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Question {currentQuestion + 1} of {test.questions.length}
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 300 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                    <MdOutlineTimer className={`w-5 h-5 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
                </div>

                <button 
                    onClick={() => { if(window.confirm("Submit test?")) handleSubmit(); }}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-emerald-600 transition-all font-black text-xs uppercase tracking-widest"
                >
                    {isSubmitting ? "Submitting..." : "Finish"}
                </button>
            </header>

            {/* Question Area */}
            <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 md:p-10 gap-10">
                
                {/* Left: Question Content */}
                <div className="flex-1 space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                            {question.type} • {question.marks} Points
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                            {question.questionText}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(question.type === "mcq" || (question.type === "obt" && question.options?.length > 0)) ? (
                            question.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`group flex items-center gap-6 p-6 rounded-[32px] border-2 text-left transition-all ${
                                        selectedAns?.selectedOption === idx 
                                        ? 'bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-500/10' 
                                        : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                                        selectedAns?.selectedOption === idx 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-400'
                                    }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={`text-lg font-bold transition-colors ${
                                        selectedAns?.selectedOption === idx ? 'text-indigo-900' : 'text-gray-700'
                                    }`}>
                                        {opt.text}
                                    </span>
                                    {selectedAns?.selectedOption === idx && (
                                        <MdCheckCircle className="ml-auto w-8 h-8 text-indigo-600" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your Answer</label>
                                {question.type === "essay" ? (
                                    <textarea
                                        value={selectedAns?.textAnswer || ""}
                                        onChange={(e) => handleTextAnswer(e.target.value)}
                                        rows="6"
                                        placeholder="Type your essay response here..."
                                        className="w-full p-6 rounded-[32px] border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 text-lg transition-all"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={selectedAns?.textAnswer || ""}
                                        onChange={(e) => handleTextAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-6 rounded-[32px] border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 text-lg transition-all"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Navigation Grid */}
                <div className="w-full md:w-80 shrink-0">
                    <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 sticky top-32">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Question Map</h4>
                        <div className="grid grid-cols-5 gap-3">
                            {test.questions.map((_, idx) => {
                                const isAnswered = answers.find(a => a.questionId === test.questions[idx]._id);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`h-10 rounded-xl font-black text-xs transition-all ${
                                            currentQuestion === idx 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                            : isAnswered 
                                            ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                            : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-200'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                Answered
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-3 h-3 bg-white border border-gray-200 rounded-full"></div>
                                Remaining
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="bg-white border-t border-gray-100 p-6 md:px-10 flex items-center justify-between">
                <button 
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-900 disabled:opacity-0 transition-all"
                >
                    <MdArrowBack className="w-5 h-5" />
                    Previous
                </button>

                <div className="hidden md:flex gap-2">
                    {test.questions.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentQuestion === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'
                        }`}></div>
                    ))}
                </div>

                <button 
                    onClick={() => {
                        if (currentQuestion === test.questions.length - 1) {
                            if(window.confirm("Finish and submit?")) handleSubmit();
                        } else {
                            setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1));
                        }
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                    {currentQuestion === test.questions.length - 1 ? "Finish" : "Next"}
                    <MdArrowForward className="w-5 h-5" />
                </button>
            </footer>
        </div>
    );
};

export default TakeTest;

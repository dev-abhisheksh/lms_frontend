import React from 'react'

const Profile = () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const role = localStorage.getItem("role");

    if (!user) return <div className="p-8 text-center">Please login to view profile.</div>;

    const infoCls = "flex flex-col gap-1 p-4 bg-gray-50 rounded-lg border border-gray-100";
    const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider";
    const valCls = "text-sm font-medium text-gray-900";

    return (
        <div className="h-full w-full bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-12 left-6">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-3xl">
                                    {user.fullName?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-14">
                            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                            <p className="text-sm text-gray-500 capitalize">{role}</p>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={infoCls}>
                        <span className={labelCls}>Email Address</span>
                        <span className={valCls}>{user.email}</span>
                    </div>
                    <div className={infoCls}>
                        <span className={labelCls}>Username</span>
                        <span className={valCls}>@{user.username}</span>
                    </div>
                    <div className={infoCls}>
                        <span className={labelCls}>Department / Group</span>
                        <span className={valCls}>{user.department?.name || "Not Assigned"}</span>
                    </div>
                    
                    {role === "student" && (
                        <>
                            <div className={infoCls}>
                                <span className={labelCls}>Standard / Year</span>
                                <span className={valCls}>{user.year || "N/A"}</span>
                            </div>
                            <div className={infoCls}>
                                <span className={labelCls}>Section / Division</span>
                                <span className={valCls}>{user.section || "N/A"}</span>
                            </div>
                            <div className={infoCls}>
                                <span className={labelCls}>Admission / Cohort Year</span>
                                <span className={valCls}>{user.cohortYear || "N/A"}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-purple-900">Account Status</h3>
                        <p className="text-xs text-purple-700">Your account is active and verified.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
                </div>
            </div>
        </div>
    )
}

export default Profile

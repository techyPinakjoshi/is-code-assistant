

import React from 'react';

const iconClass = "h-8 w-8";
const premiumIconClass = "h-5 w-5";

export const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export const AppleIcon = () => (
    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.33 13.08c0 1.29-.62 2.4-1.6 3.35-.9.88-2.11 1.4-3.23 1.41-.34 0-.68.02-1.01.02-.73 0-1.5-.16-2.28-.49-.78-.32-1.54-.64-2.3-.64-.8 0-1.61.34-2.42.7-1.02.45-2.04.83-3.03.81-1.42-.03-2.5-1.05-3.21-2.45-.72-1.42-.92-3.03-.52-4.6.4-1.57 1.4-2.89 2.78-3.72.93-.57 1.95-.87 2.99-.86.3 0 .61 0 .91.01.76.03 1.54.19 2.3.49.74.3 1.44.57 2.11.57.65 0 1.35-.29 2.07-.6 1.05-.45 2.15-.81 3.29-.75.45.02.89.11 1.31.29.13.06.26.12.38.19-1.2 1.05-1.89 2.58-1.89 4.23zM16.34 7.6c.55-.65 1-1.38 1.25-2.18-.38-.01-.76-.02-1.15-.02-1.04 0-2.05.35-2.88.98-.75.56-1.41 1.33-1.89 2.23.28.02.57.03.86.03.95 0 1.91-.32 2.81-.94z"/>
    </svg>
);

export const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={premiumIconClass} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
    </svg>
);

export const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" />
    </svg>
);

export const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const SiteAnalysisIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

export const TeamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h4m5 6H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
    </svg>
);

export const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

export const ApiKeyIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m0-4h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m-2-4h.01M17 11h.01" />
    </svg>
);

export const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);


export const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#78909C" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        <path fill="#B0BEC5" d="M7 18h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z"/>
    </svg>
);
export const RoadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#607D8B" d="M4 22h16V2H4v20z"/>
        <path fill="#FFF176" d="M11 2h2v5h-2V2zm0 7h2v5h-2v-5zm0 7h2v5h-2v-5z"/>
        <path fill="#81C784" d="M2 2h2v20H2V2zm18 0h2v20h-2V2z"/>
    </svg>
);
export const DamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#42A5F5" d="M2 15h20v5H2z"/>
        <path fill="#A1887F" d="M3 10h18v5H3z"/>
        <path fill="#BDBDBD" d="M4 5h16l-1 5H5z"/>
        <path fill="#FFFFFF" d="M4 16h2v3H4zm4 0h2v3H8zm4 0h2v3h-2zm4 0h2v3h-2z"/>
    </svg>
);
export const WaterTankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#90A4AE" d="M4 21h1v-8h-1zm15 0h1v-8h-1zM6 21h1v-5H6zm11 0h1v-5H17z"/>
        <path fill="#B0BEC5" d="M3 5h18v3H3z"/>
        <path fill="#CFD8DC" d="M5 8h14v11H5z"/>
        <path fill="#4FC3F7" d="M6 10h12v7H6z"/>
    </svg>
);
export const MaterialIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#E57373" d="M2 2h8v8H2z"/>
        <path fill="#C62828" d="M2 14h8v8H2z"/>
        <path fill="#EF5350" d="M14 2h8v8h-8z"/>
        <path fill="#D32F2F" d="M14 14h8v8h-8z"/>
        <circle cx="12" cy="12" r="7" fill="#607D8B"/>
        <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
        <path d="M12 8a4 4 0 0 0-4 4h2a2 2 0 1 1 2-2v-2z" fill="#B0BEC5"/>
    </svg>
);
export const AuditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#A1887F" d="M15 2H9c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-5-5z"/>
        <path fill="#CFD8DC" d="M14 2v6h6l-6-6z" opacity=".5"/>
        <path fill="#FFFFFF" d="M17 12H9v-1h8v1zm-8 3h8v-1H9v1zm0 3h5v-1H9v1z"/>
        <path fill="#8BC34A" d="M6 14l-2-2-1.41 1.41L6 16.83l4.59-4.59L9.17 10.83z"/>
    </svg>
);
export const BridgeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#64B5F6" d="M22 15.5c0 1.1-.9 2-2 2h-2v-4h4v2zM2 15.5c0 1.1.9 2 2 2h2v-4H2v2z"/>
        <path fill="#A1887F" d="M2 12h20v2H2z"/>
        <path fill="#BDBDBD" d="M2 14h3v5H2zm17 0h3v5h-3z"/>
        <path fill="#757575" d="M7 14h3v5H7zm7 0h3v5h-3z"/>
        <path fill="#FFB74D" d="M6.5 12c0-3.5 2-6 5.5-6s5.5 2.5 5.5 6H6.5z"/>
        <path fill="#FFE082" d="M8 12c0-2.5 1.5-4 4-4s4 1.5 4 4H8z"/>
    </svg>
);

export const PipelineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#607D8B" d="M4 11h18v2H4z"/>
        <path fill="#42A5F5" d="M2 10h4v4H2z"/>
        <path fill="#1976D2" d="M18 10h4v4h-4z"/>
        <path fill="#607D8B" d="M11 4v18h2V4z"/>
    </svg>
);

export const ElectricalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#1E88E5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path fill="#FFEB3B" d="M13 4.05v5.02h3.03L11 19.95v-5.02H7.97L13 4.05z"/>
    </svg>
);

export const FireSafetyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#757575" d="M11 17h2v-2.13c1.73-.44 3-2.03 3-3.87 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 1.84 1.27 3.43 3 3.87V17z"/>
        <path fill="#F44336" d="M16 5H8v5.13c-1.73.44-3 2.03-3 3.87 0 2.21 1.79 4 4 4h1v2H9v2h6v-2h-1v-2c2.21 0 4-1.79 4-4 0-1.84-1.27-3.43-3-3.87V5zm-4 12c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
        <path fill="#424242" d="M12 3c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
    </svg>
);

export const EarthquakeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#78909C" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        <path d="M1 9h2l1-3 2 5 2-4 1 2h2" stroke="#F44336" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M21 9h-2l-1-3-2 5-2-4-1 2h-2" stroke="#F44336" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M5 15.5h14" stroke="#F44336" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
);

export const WindLoadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none">
        <path fill="#B0BEC5" d="M15 21h-2V3h2v18zM19 21h-2V10h2v11zM11 21H9V6h2v15z"/>
        <path d="M2 7c4 0 4-4 8-4s4 4 8 4" stroke="#4FC3F7" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M2 12c4 0 4-4 8-4s4 4 8 4" stroke="#4FC3F7" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
        <path d="M2 17c4 0 4-4 8-4s4 4 8 4" stroke="#4FC3F7" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
    </svg>
);

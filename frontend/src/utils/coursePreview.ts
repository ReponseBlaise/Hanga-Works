const PREFIX = 'hanga:course-preview:';

export function getPreviewModuleId(courseId: string): string | null {
	try {
		return localStorage.getItem(`${PREFIX}${courseId}`);
	} catch {
		return null;
	}
}

export function setPreviewModuleId(courseId: string, moduleId: string) {
	try {
		localStorage.setItem(`${PREFIX}${courseId}`, moduleId);
	} catch {
		// ignore quota / private mode
	}
}

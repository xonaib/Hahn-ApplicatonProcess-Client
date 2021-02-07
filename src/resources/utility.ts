/** Compares if objects are equal */
export function areEqual(obj1: any, obj2: any): boolean {
	return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && (obj1[key] === obj2[key]));
}

/** checks for null */
export function isNull(obj1: any): boolean {
	return obj1 == null;
}

export function isNullOrEmpty(obj1: string): boolean {
	return (isNull(obj1) || obj1.length == 0);
}
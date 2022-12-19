// validate password with rules
//	- min length is 8 characters: (?=.{8,})
//	- contains at least one lowercase letter: (?=.*[a-z]+)
//	- contains at least one uppercase letter: (?=.*[A-Z]+)
//	- contains at least one number: (?=.*\d+)
export const passwordRegex = /(?=.{8,})^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\d+)/;

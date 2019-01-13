module.exports = {
	isObjectIdCastException(err) {
		return err.name === 'CastError' && err.kind === 'ObjectId';
	},
	
	isOfObjectIdLength(testString) {
		return testString.length === 24;
	}
}
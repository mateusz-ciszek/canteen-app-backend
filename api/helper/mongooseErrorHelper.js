module.exports = {
	isObjectIdCastException(err) {
		return err.name === 'CastError' && err.kind === 'ObjectId';
	}
}
import mongoose from 'mongoose';

	export async function connect(): Promise<typeof mongoose> {
		return await mongoose.connect(
			`mongodb+srv://test:test-dev@canteen-application-dev-hkbxg.mongodb.net/dev?retryWrites=true`,
			{ useNewUrlParser: true }
		);
	};

	export async function disconnect(): Promise<void> {
		return await mongoose.disconnect();
	};
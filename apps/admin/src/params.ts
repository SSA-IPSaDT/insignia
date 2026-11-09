import { userBaseSchema } from '@insignia/contracts';
import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
    uuid: userBaseSchema.shape.id,
});

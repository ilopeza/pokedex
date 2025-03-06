import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.string().required(),
    PORT: Joi.number().default(3001),
    DEFAULT_LIMIT: Joi.number().default(7),
    DEFAULT_OFFSET: Joi.number().default(1),
});
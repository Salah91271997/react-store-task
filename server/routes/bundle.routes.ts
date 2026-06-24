import { Router } from 'express';
import * as controller from '../controllers/bundle.controller';

export const apiRouter = Router();

apiRouter.get('/health', controller.health);
apiRouter.get('/bundle', controller.bundle);
apiRouter.get('/products/:id', controller.product);
apiRouter.post('/quote', controller.quote);

import { Injectable, LoggerService } from '@nestjs/common';
import cluster from 'cluster';
import os from 'os';

const workers = [];

@Injectable()
export class ClusterService {
  static clusterize(logger: LoggerService, callback: (...args) => void): void {
    if (cluster.isPrimary) {
      logger.debug(`Master Server started on (${process.pid})`);
      const numCPUs = os.cpus().length;
      for (let i = 0; i < numCPUs; i++) {
        this.addWorker();
      }

      cluster.on('exit', (worker, code, signal) => {
        logger.debug(
          `worker ${worker.process.pid} exited. (signal: ${signal}). Trying to respawn...`,
        );
        this.removeWorker(worker.id);
        this.addWorker();
      });
    } else {
      logger.debug(`Cluster server started on ${process.pid}`);
      callback();
    }
  }

  private static addWorker() {
    workers.push(cluster.fork().id);
  }

  private static removeWorker(workerId: number) {
    workers.splice(workers.indexOf(workerId), 1);
  }
}

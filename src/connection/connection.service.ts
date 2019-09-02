import {
  Injectable,
  OnApplicationShutdown,
  OnApplicationBootstrap,
  BeforeApplicationShutdown,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Server } from 'http';
import { Socket } from 'net';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

interface Connection {
  id: number;
  conn: Socket;
}

@Injectable()
export class ConnectionService
  implements
    OnApplicationBootstrap,
    BeforeApplicationShutdown,
    OnApplicationShutdown,
    OnModuleDestroy {
  private httpServer!: Server;
  private connections = new Array<Connection>();
  private logger: Logger;
  private connId: number = 0;
  private acceptingConnections = true;

  constructor(private refHost: HttpAdapterHost<ExpressAdapter>) {
    this.logger = new Logger('ConnectionService');
  }

  onModuleDestroy() {
    this.acceptingConnections = false;
  }

  async beforeApplicationShutdown() {
    if (this.connections.length) {
      this.logger.log('beforeApplicationShutdown called');
      this.logger.log(
        `There are ${this.connections.length} pending connections. Trying to close gracefully...`
      );
      this.connections.forEach(connection => connection.conn.end());
      await sleep(5000);
    } else {
      this.logger.log('No pending connections needed to be gracefully closed.');
    }
  }

  onApplicationShutdown() {
    if (this.connections.length) {
      this.logger.log('onApplicationShutdown called');
      this.logger.log(
        `There are ${this.connections.length} pending connections. Closing forcibly...`
      );
      this.connections.forEach(connection => connection.conn.destroy());
    } else {
      this.logger.log(
        'No pending connections needed to be forcibly closed. Yay! :)'
      );
    }
  }

  onApplicationBootstrap() {
    this.httpServer = this.refHost.httpAdapter.getHttpServer();
    this.startCollectingConnections();
  }

  private startCollectingConnections() {
    this.httpServer.on('connection', connection => {
      if (!this.acceptingConnections) {
        this.logger.log(`Rejecting connection attempt after shutdown started.`);
        connection.write('HTTP/1.1 503 Service Unavailable\n');
        connection.write('Connection: close\n');
        connection.write('Content-Type: text/html\n');
        connection.write(
          '\n<html><body><h1>Sorry, the server is unavailable at this time.</h1><body></html>\n'
        );
        connection.end();
      } else {
        this.connId++;
        this.connections.push({ id: this.connId, conn: connection });
        this.logger.log(
          `Connection #${this.connId} added.  ${this.connections.length} connections now open.`
        );

        connection.on('close', () => {
          const connectionIndex = this.connections.findIndex(
            storedConnection => storedConnection.conn === connection
          );
          const id = this.connections[connectionIndex].id;
          this.connections.splice(connectionIndex, 1);
          this.logger.log(
            `Connection #${id} closed.  ${this.connections.length} connections remain open.`
          );
        });
      }
    });
  }
}

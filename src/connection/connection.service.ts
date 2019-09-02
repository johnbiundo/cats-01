import { Injectable, OnApplicationShutdown, OnApplicationBootstrap, BeforeApplicationShutdown, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Server } from 'http';
import { Socket } from 'net';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

@Injectable()
export class ConnectionService implements OnApplicationBootstrap, BeforeApplicationShutdown, OnApplicationShutdown {
  private httpServer!: Server;
  private connections = new Array<Socket>();
  private logger: Logger;

  constructor(private refHost: HttpAdapterHost<ExpressAdapter>) {
    this.logger = new Logger('ConnectionService');
  }

  async beforeApplicationShutdown() {
    if (this.connections.length) {
      this.logger.log(`There are ${this.connections.length} pending connections. Trying to close gracefully`);
      this.connections.forEach(connection => connection.destroy());
      await sleep(5000);
    }
  }

  onApplicationShutdown() {
    if (this.connections.length) {
      this.logger.log(`There are ${this.connections.length} pending connections. Closing forcefully`);
      this.connections.forEach(connection => connection.end());
    } else {
      this.logger.log('No pending connections needed to be forcefully closed. Yey :)');
    }
  }

  onApplicationBootstrap() {
    this.httpServer = this.refHost.httpAdapter.getHttpServer();
    this.startCollectingConnections();
  }

  private startCollectingConnections() {
    this.httpServer.on('connection', connection => {
      this.logger.log(`Connection #${this.connections.length} added`);
      this.connections.push(connection);

      connection.on('close', () => {
        const connectionIndex = this.connections.findIndex(storedConnection => storedConnection === connection);
        this.logger.log(`Connection #${connectionIndex} closed`);
        this.connections.splice(connectionIndex, 1);
      });
    });
  }
}

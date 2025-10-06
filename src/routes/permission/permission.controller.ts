import { ZodSerializerDto } from 'nestjs-zod';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Auth } from 'src/shared/decorator/auth.decorator';
import { AuthTypes } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import {
  AssignRoleToPermissionDTO,
  AssignRoleToPermissionResDTO,
  CreatePermisionBodyDTO,
  CreatePermisionResDTO,
  GetAllPermissionResDTO,
  GetPermissionDetailResDTO,
  GetPermissionQueryDTO,
  GetPermissionsResDTO,
  PermissisonIdParamDTO,
  UpdatePermisionBodyDTO,
  UpdatePermisionResDTO,
} from './dto/permission.dto';
import { RequireClientRole } from 'src/shared/decorator/role.decorator';
import { MessageResDTO } from '../auth/dto/auth.dto';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/shared/pipes/objectid.pipe';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Creates a new permission in the system.
   * This endpoint allows authenticated users to create a new permission record.
   * The permission defines an allowed action (path + HTTP method) that can be assigned to roles.
   * @param body - The DTO containing permission details (name, description, path, method).
   * @param userId - The ID of the currently authenticated user, extracted from the access token.
   * @returns The created permission record.
   **/
  @Auth([AuthTypes.BEARER])
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permission created successfully',
    type: CreatePermisionResDTO,
  })
  @ZodSerializerDto(CreatePermisionResDTO)
  async createPermission(
    @Body() body: CreatePermisionBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return await this.permissionService.createPermission({
      data: body,
      createdById: userId,
    });
  }

  /**
   * Updates an existing permission.
   * Authenticated users can modify fields of a permission (e.g., name, description, path, method).
   * Audits the updater by saving `updatedById`.
   * @param params - Route params containing the target permission ID.
   * @param body - The DTO with fields to update.
   * @param userId - The ID of the currently authenticated user, extracted from the access token.
   * @returns The updated permission record.
   */
  @Patch(':permissionId')
  @Auth([AuthTypes.BEARER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission updated successfully',
    type: UpdatePermisionResDTO,
  })
  @ZodSerializerDto(UpdatePermisionResDTO)
  async updatePermission(
    @Param('permissionId', ParseObjectIdPipe) permissionId: string,
    @Body() body: UpdatePermisionBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return await this.permissionService.updatePermission({
      id: permissionId,
      data: body,
      updatedById: userId,
    });
  }

  /**
   * Deletes a permission by ID.
   * Requires a valid bearer token. Soft/hard delete behavior depends on the service implementation.
   * @param params - Route params containing the permission ID to delete.
   * @returns A generic message response indicating the result.
   */
  @Auth([AuthTypes.BEARER])
  @Delete(':permissionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete permission (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission deleted successfully',
    type: MessageResDTO,
  })
  @ZodSerializerDto(MessageResDTO)
  async deletePermission(
    @Param('permissionId', ParseObjectIdPipe) permissionId: string,
  ) {
    return await this.permissionService.deletePermission({ id: permissionId });
  }

  /**
   * Assigns roles to a permission.
   * Allows linking one permission with one or more roles (or replacing/merging based on service rules).
   * @param params - Route params with the target permission ID.
   * @param body - The DTO describing role assignments to apply.
   * @returns The permission with its updated role assignments.
   */
  @Auth([AuthTypes.BEARER])
  @Post(':permissionId/roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign roles to permission' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Roles assigned successfully',
    type: AssignRoleToPermissionResDTO,
  })
  @ZodSerializerDto(AssignRoleToPermissionResDTO)
  async assignRoleToPermission(
    @Param('permissionId', ParseObjectIdPipe) permissionId: string,
    @Body() body: AssignRoleToPermissionDTO,
  ) {
    return await this.permissionService.assignRoleToPermission(
      permissionId,
      body,
    );
  }

  /**
   * Retrieves a paginated list of permissions.
   * @param queryParams - Pagination and filter options (e.g., page, limit, search keyword).
   * @returns A paginated collection of permissions with metadata.
   */
  @Auth([AuthTypes.BEARER])
  @Get('pagination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List permissions (paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions fetched successfully (paginated)',
    type: GetPermissionsResDTO,
  })
  @ZodSerializerDto(GetPermissionsResDTO)
  async findAll(@Query() queryParams: GetPermissionQueryDTO) {
    return await this.permissionService.findAll(queryParams);
  }

  /**
   * Retrieves a single permission by ID.
   * Returns detailed information about the specified permission.
   * @param params - Route params containing the permission ID.
   * @returns The permission detail record.
   */
  @Auth([AuthTypes.BEARER])
  @Get(':permissionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission fetched successfully',
    type: GetPermissionDetailResDTO,
  })
  @ZodSerializerDto(GetPermissionDetailResDTO)
  async findOne(
    @Param('permissionId', ParseObjectIdPipe) permissionId: string,
  ) {
    return await this.permissionService.findOne(permissionId);
  }

  /**
   * Retrieves all permissions (non-paginated).
   * @returns The complete list of permissions.
   */
  @Auth([AuthTypes.BEARER])
  @Get()
  @RequireClientRole()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all permissions (non-paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All permissions fetched successfully',
    type: GetAllPermissionResDTO,
  })
  @ZodSerializerDto(GetAllPermissionResDTO)
  async getAllPermission() {
    return await this.permissionService.getAllPermission();
  }
}

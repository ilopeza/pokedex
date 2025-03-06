import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/commons/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit;
  private defaultOffset; 

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService) {
      this.defaultLimit = this.configService.get<number>('defaultLimit');
      this.defaultOffset = this.configService.get('defaultOffset');
     }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(pagination: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.defaultOffset } = pagination;
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset);
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term }) || null;
    } else if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term) || null;
    } else {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() }) || null;
    }

    if (!pokemon) {
      throw new NotFoundException('Pokemon not found');
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      const updatedPokemon = await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatedPokemon };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException('Pokemon already exists');
    }
    console.log(error);
    throw new InternalServerErrorException(error.message);
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (!deletedCount || deletedCount === 0) {
      throw new NotFoundException('Pokemon not found');
    }
    return;
  }
}
